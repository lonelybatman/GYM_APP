"""
extract_angles.py
-----------------
Liest ein Bench-Press-Video, extrahiert per MediaPipe Pose die 3D-Landmarks
und berechnet daraus Schulter-Elevation und Ellbogen-Flexion für jedes Frame.

Kompatibel mit MediaPipe >= 0.10 (Tasks API).

Output:
  ../results/angles.csv   — ein Frame pro Zeile
  ../results/angles.json  — strukturierte Zusammenfassung

Verwendung (in conda-Umgebung 'mediapipe-env'):
  python extract_angles.py
  python extract_angles.py --video ../mp4/benchpress_0.mp4
  python extract_angles.py --video ../mp4/benchpress_0.mp4 --preview
"""

import argparse
import json
import math
import os
import csv
import urllib.request

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
DEFAULT_VIDEO = os.path.join(SCRIPT_DIR, "..", "mp4", "benchpress_0.mp4")
RESULTS_DIR   = os.path.join(SCRIPT_DIR, "..", "results")
MODEL_PATH    = os.path.join(SCRIPT_DIR, "..", "models", "pose_landmarker_full.task")
MODEL_URL     = (
    "https://storage.googleapis.com/mediapipe-models/"
    "pose_landmarker/pose_landmarker_full/float16/latest/"
    "pose_landmarker_full.task"
)

# Landmark-Indizes (MediaPipe Pose, 33 Punkte)
IDX = {
    "nose":        0,
    "shoulder_l": 11, "shoulder_r": 12,
    "elbow_l":    13, "elbow_r":    14,
    "wrist_l":    15, "wrist_r":    16,
    "hip_l":      23, "hip_r":      24,
}

# ---------------------------------------------------------------------------
# Modell herunterladen falls nicht vorhanden
# ---------------------------------------------------------------------------

def ensure_model():
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    if not os.path.exists(MODEL_PATH):
        print(f"Lade Pose-Modell herunter (~30 MB) ...")
        print(f"  Von: {MODEL_URL}")
        print(f"  Nach: {MODEL_PATH}")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH,
            reporthook=lambda b, bs, total: print(
                f"\r  {b*bs/1e6:.1f} / {total/1e6:.1f} MB", end="", flush=True)
            if total > 0 else None
        )
        print("\nModell heruntergeladen.")
    else:
        print(f"Modell vorhanden: {MODEL_PATH}")


# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def lm_to_vec(landmarks, key):
    """Gibt (x, y, z) als numpy-Array zurück."""
    p = landmarks[IDX[key]]
    return np.array([p.x, p.y, p.z])


def angle_between(a, b, c):
    """Winkel am Punkt B (in Grad)."""
    ba = a - b
    bc = c - b
    cos_a = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-9)
    return math.degrees(math.acos(np.clip(cos_a, -1.0, 1.0)))


def shoulder_elevation(shoulder, hip, elbow):
    """
    Winkel zwischen Rumpf (Schulter→Hüfte) und Oberarm (Schulter→Ellbogen).
    0° = Arm parallel zum Rumpf, 90° = Arm horizontal (Bankdrücken flach),
    180° = Arm über dem Kopf (Schulterdrücken).
    """
    return angle_between(hip, shoulder, elbow) - 90.0


def elbow_flexion(shoulder, elbow, wrist):
    """180° = Lockout, ~90° = untere Position beim Bankdrücken."""
    return angle_between(shoulder, elbow, wrist)


def best_side(landmarks):
    """Wählt die Seite mit besserer Visibility."""
    vis_r = landmarks[IDX["shoulder_r"]].visibility + landmarks[IDX["elbow_r"]].visibility
    vis_l = landmarks[IDX["shoulder_l"]].visibility + landmarks[IDX["elbow_l"]].visibility
    return "right" if vis_r >= vis_l else "left"


def draw_angle_info(frame, sh_elev, elb_flex, side):
    """Schreibt Winkel-Info oben ins Bild."""
    text = f"{side.upper()}  |  Schulter: {sh_elev:.1f} deg  |  Ellbogen: {elb_flex:.1f} deg"
    cv2.putText(frame, text, (10, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)


# ---------------------------------------------------------------------------
# Haupt-Verarbeitung
# ---------------------------------------------------------------------------

def process_video(video_path: str, show_preview: bool = False):
    ensure_model()
    os.makedirs(RESULTS_DIR, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Video nicht gefunden: {video_path}")

    fps   = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"\nVideo: {os.path.basename(video_path)}")
    print(f"FPS: {fps:.1f}  |  Frames gesamt: {total}\n")

    # MediaPipe Tasks API
    base_opts  = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
    pose_opts  = mp_vision.PoseLandmarkerOptions(
        base_options=base_opts,
        running_mode=mp_vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        output_segmentation_masks=False,
    )
    landmarker = mp_vision.PoseLandmarker.create_from_options(pose_opts)

    rows      = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        timestamp_ms = int((frame_idx / fps) * 1000)

        # BGR → RGB → MediaPipe Image
        rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result   = landmarker.detect_for_video(mp_image, timestamp_ms)

        row = {
            "frame":         frame_idx,
            "time_s":        round(frame_idx / fps, 4),
            "side":          "none",
            "shoulder_elev": None,
            "elbow_flex":    None,
        }

        if result.pose_world_landmarks:
            lm   = result.pose_world_landmarks[0]
            side = best_side(lm)

            suffix = f"_{side[0]}"  # "_r" oder "_l"
            shoulder = lm_to_vec(lm, f"shoulder_{side[0]}")
            elbow    = lm_to_vec(lm, f"elbow_{side[0]}")
            wrist    = lm_to_vec(lm, f"wrist_{side[0]}")
            hip      = lm_to_vec(lm, f"hip_{side[0]}")

            sh_elev  = shoulder_elevation(shoulder, hip, elbow)
            elb_flex = elbow_flexion(shoulder, elbow, wrist)

            row.update({
                "side":          side,
                "shoulder_elev": round(sh_elev, 2),
                "elbow_flex":    round(elb_flex, 2),
            })

            if show_preview:
                draw_angle_info(frame, sh_elev, elb_flex, side)

        rows.append(row)

        if show_preview:
            cv2.imshow("MediaPipe Pose", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        frame_idx += 1
        if frame_idx % 50 == 0:
            print(f"  Frame {frame_idx}/{total} ...")

    cap.release()
    if show_preview:
        cv2.destroyAllWindows()
    landmarker.close()

    print(f"\nFertig: {frame_idx} Frames verarbeitet.")

    # -----------------------------------------------------------------------
    # CSV speichern
    # -----------------------------------------------------------------------
    csv_path = os.path.join(RESULTS_DIR, "angles.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"CSV:  {csv_path}")

    # -----------------------------------------------------------------------
    # Statistik
    # -----------------------------------------------------------------------
    valid     = [r for r in rows if r["shoulder_elev"] is not None]
    sh_vals   = [r["shoulder_elev"] for r in valid]
    elb_vals  = [r["elbow_flex"]    for r in valid]

    def stats(vals):
        if not vals:
            return {}
        return {
            "min":    round(float(np.min(vals)), 2),
            "max":    round(float(np.max(vals)), 2),
            "mean":   round(float(np.mean(vals)), 2),
            "median": round(float(np.median(vals)), 2),
        }

    summary = {
        "video":                  os.path.basename(video_path),
        "fps":                    fps,
        "total_frames":           frame_idx,
        "valid_frames":           len(valid),
        "shoulder_elevation_deg": stats(sh_vals),
        "elbow_flexion_deg":      stats(elb_vals),
        "frames":                 rows,
    }

    json_path = os.path.join(RESULTS_DIR, "angles.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"JSON: {json_path}")

    # -----------------------------------------------------------------------
    # Ergebnis
    # -----------------------------------------------------------------------
    print("\n=== ERGEBNIS ===")
    s = stats(sh_vals)
    e = stats(elb_vals)
    print(f"Schulter-Elevation:  min={s.get('min')}°  max={s.get('max')}°  mean={s.get('mean')}°")
    print(f"Ellbogen-Flexion:    min={e.get('min')}°  max={e.get('max')}°  mean={e.get('mean')}°")

    return summary


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video",   default=DEFAULT_VIDEO)
    parser.add_argument("--preview", action="store_true")
    args = parser.parse_args()

    process_video(args.video, show_preview=args.preview)

import opensim as osim

MODEL_PATH = r"C:\Users\kubis\gym-app\OpenSim\MobL_ARMS_OpenSim3_bimanual_model\Bimanual Upper Arm Model\MoBL_ARMS_bimanual_6_2_21.osim"

model = osim.Model(MODEL_PATH)
state = model.initSystem()

print("=== KOORDINATEN ===")
coords = model.getCoordinateSet()
for i in range(coords.getSize()):
    c = coords.get(i)
    print(f"{c.getName():40s} default={c.getDefaultValue():.4f} rad")

print("\n=== BODIES ===")
bodies = model.getBodySet()
for i in range(bodies.getSize()):
    print(bodies.get(i).getName())

print("\n=== MUSKELN ===")
muscles = model.getMuscles()
for i in range(muscles.getSize()):
    print(muscles.get(i).getName())

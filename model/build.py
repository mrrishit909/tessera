"""TESSERA kit: a gilded frame and an examination easel. Deterministic.
Run: Blender -b -P model/build.py   (writes model/source.blend, model/exports/*.glb, model/renders/poster.png)"""
import bpy, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "exports")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(HERE, "renders"), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, color, metal=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m

M = {
    "gold": mat("GildedGold", (0.78, 0.63, 0.36), 0.85, 0.3),
    "canvas": mat("Parchment", (0.87, 0.82, 0.72), 0, 0.85),
    "wood": mat("VarnishBrown", (0.3, 0.2, 0.14), 0, 0.6),
}

def obj(name, mesh_fn, material, loc=(0, 0, 0), parent=None):
    bpy.ops.object.select_all(action="DESELECT")
    mesh_fn()
    o = bpy.context.active_object
    o.name = name
    o.location = loc
    o.data.materials.append(M[material] if isinstance(material, str) else material)
    if parent:
        o.parent = parent
    return o

def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    scene.collection.objects.link(e)
    e.location = loc
    if parent:
        e.parent = parent
    return e

def smooth(o):
    for p in o.data.polygons: p.use_smooth = True

# --- frame: four gilded bars around a canvas plane
frame_root = empty("Frame", (0, 0, 0))
canvas = obj("FrameCanvas", lambda: bpy.ops.mesh.primitive_plane_add(size=1), "canvas", (0, 0, 0), frame_root)
canvas.scale = (0.9, 1.2, 1)
canvas.rotation_euler = (math.pi / 2, 0, 0)
for name, loc, scale in (("FrameTop", (0, 0.015, 0.62), (0.98, 0.04, 0.04)), ("FrameBottom", (0, 0.015, -0.62), (0.98, 0.04, 0.04)), ("FrameLeft", (-0.47, 0.015, 0), (0.04, 0.04, 1.24)), ("FrameRight", (0.47, 0.015, 0), (0.04, 0.04, 1.24))):
    bar = obj(name, lambda: bpy.ops.mesh.primitive_cube_add(size=1), "gold", loc, frame_root)
    bar.scale = scale

# --- easel: two legs and a crossbar
easel_root = empty("Easel", (0, 0, 0))
for sx in (-0.3, 0.3):
    obj("Leg", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.025, depth=1.4, rotation=(0, 0.15 * (1 if sx > 0 else -1), 0)), "wood", (sx, 0, 0.6), easel_root)
obj("Crossbar", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.02, depth=0.7, rotation=(0, math.pi / 2, 0)), "wood", (0, 0, 0.3), easel_root)

def hide(o):
    o.hide_render = True
    for c in o.children: hide(c)
bpy.ops.object.camera_add(location=(2.2, -2.6, 1.2)); cam_o = bpy.context.active_object
cam_o.name = "PosterCam"; scene.camera = cam_o; cam_o.data.lens = 40
cam_o.rotation_euler = (1.25, 0, 0.6)
for name, loc, e, col in (("Key", (-1.6, -2.2, 2.6), 900, (0.78, 0.63, 0.36)), ("Rim", (2.4, 1.6, 1.4), 500, (0.35, 0.44, 0.38)), ("Fill", (0, -0.6, -0.6), 150, (0.08, 0.23, 0.45))):
    bpy.ops.object.light_add(type="POINT", location=loc); l = bpy.context.active_object
    l.name = name; l.data.energy = e; l.data.color = col
world = bpy.data.worlds.new("Ultramarine"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.004, 0.006, 0.014, 1)
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x, scene.render.resolution_y = 1280, 720
scene.render.filepath = os.path.join(HERE, "renders", "poster.png")

def export(name, parents):
    bpy.ops.object.select_all(action="DESELECT")
    def pick(o):
        o.select_set(True)
        for c in o.children: pick(c)
    for p in parents: pick(p)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name), export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_cameras=False, export_lights=False)

export("frame.glb", [frame_root])
export("easel.glb", [easel_root])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "source.blend"))
try:
    bpy.ops.render.render(write_still=True)
except Exception as e:
    print("poster render failed:", e)
print("BUILD OK")

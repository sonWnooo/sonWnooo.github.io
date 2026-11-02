# Reference maple scene

The existing Zcode scene is `../js/main.js`. Butterfly control, wing animation,
individual leaf physics, glow and tuning controls remain in that runtime.

Changed modeling: 240-sample chipped irregular ground boundary with local concave
bites and a thin 0.15-unit edge; a heavier crooked trunk with asymmetric tapered
branches and sparse leaves; five-lobed maple geometry with pointed tips and
deep sinuses. Leaf sRGB colors now convert correctly to linear rendering colors.
Ambient leaves were reduced to make the tree silhouette visible.

`Maple_Reference_Model.blend` is the editable ground/tree/leaf source.
`Maple_Reference_Model.glb` is its standard export. The Blender build script also
exports `../js/reference-maple-geometry.js`, used directly by the browser so its
instanced interactive leaves keep the existing physics and shaders.

`Butterfly_Maple_Complete.blend` contains actual web scene geometry, including
the existing butterfly, rocks, branch and leaf layers. It is a static snapshot;
interactive behavior runs in the web scene. Textures are packed into the blend.

Rebuild using Blender `--background --python ../scripts/build_reference_maple.py`.
The one-time integration script is safe to re-run. Run `check_reference.cjs` to
capture the web snapshot, then Blender `import_runtime_scene.py` to refresh the
complete editable scene.

Verification: Blender 5.2.2 saved both blend files and exported the GLB; JavaScript
syntax checks passed; Chrome loaded the scene with no page errors and verified
butterfly movement and active leaf agitation. The existing TresJS default-camera
warning is recorded in `reference-check.json` and excluded from failures.

Connection status: no Blender MCP was configured, no server was listening on
the standard port, and plugin discovery returned no Blender plugin. This work
used the installed Blender executable, not an MCP connection.

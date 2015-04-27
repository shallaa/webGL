new Canvas3D(id).render(world)
new World().setRenderer('webgl', id).render() [program]
world.addScene(id, new Scene());
world.addRender(index, sceneId, cameraId);
world.addGeometry(id, new Geometry(vertex, index, programID,...));
new Scene(id) [program]
scene.addTexture(id, new Texture(type, programID,...));
scene.addCamera(id, new Camera(t, l, w, h));
var camera = new Camera(...);
camera.addFilter(id, new Filter());
scene.addLight(id, new [Type]Light());
new Group() [meshes]
var group = new Group();
group.addMesh(id, new Mesh(geometryId, new Material(id, id, ...)));
group.addGroup(id, new Group());
new Geometry(vertex, index)
var mesh = new Mesh(...);
mesh.addPyshics(...);
mesh.isBillboard(true);

function World(){
	var inst = function(){
		// renderer
	};
	for( var key in World.prototype ){
		inst[key] = World.prototype[key];
	}
	return inst;
}
var world = new World();
requestAnimationFrame(world);
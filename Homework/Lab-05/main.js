var scene, camera, renderer;
var box, plane;
var ambientLight, directionalLight;
var lookAtPoint = new THREE.Vector3(0, 0, 0);

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.02);

    box = getBox(1, 1, 1);
    plane = getPlane(20);

    box.position.y = 0.5;
    plane.rotation.x = Math.PI / 2;

    scene.add(box);
    scene.add(plane);

    box.castShadow = true;
    plane.receiveShadow = true;

    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // trục tọa độ
    var axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    camera.position.set(3, 3, 6);
    camera.lookAt(lookAtPoint);

    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf3f7fb);
    renderer.shadowMap.enabled = true;

    document.getElementById("webgl").appendChild(renderer.domElement);

    bindControls();
    window.addEventListener("resize", onResize);

    update();
}

function getBox(w, h, d) {
	var geometry = new THREE.BoxGeometry(w, h, d);

	var material = new THREE.MeshStandardMaterial({
		color: 0x4a90e2,
		roughness: 0.35,
		metalness: 0.2
	});

	var mesh = new THREE.Mesh(
		geometry,
		material
	);

	return mesh;
}

function getPlane(size) {
    var geometry = new THREE.PlaneGeometry(size, size);

    var material = new THREE.MeshStandardMaterial({
        color: 0xe5e7eb,
        side: THREE.DoubleSide,
        roughness: 0.95,
        metalness: 0.0
    });

    return new THREE.Mesh(geometry, material);
}

function bindControls() {
    var controls = [
        "translateX", "translateY", "translateZ",
        "rotateX", "rotateY", "rotateZ",
        "scale",
        "cameraX", "cameraY", "cameraZ",
        "lookAtX", "lookAtY", "lookAtZ",

        "ambientLight", "directionalLight",

        "boxColor", "planeColor",
        "ambientColor", "directionalColor",
        "backgroundColor"
    ];

    controls.forEach(function(id) {
        document.getElementById(id).addEventListener("input", applyTransforms);
    });

    document.getElementById("reset-object").addEventListener("click", resetObject);
    document.getElementById("reset-camera").addEventListener("click", resetCamera);

    applyTransforms();
}

function applyTransforms() {
    var tx = parseFloat(document.getElementById("translateX").value);
    var ty = parseFloat(document.getElementById("translateY").value);
    var tz = parseFloat(document.getElementById("translateZ").value);

    var rx = parseFloat(document.getElementById("rotateX").value);
    var ry = parseFloat(document.getElementById("rotateY").value);
    var rz = parseFloat(document.getElementById("rotateZ").value);

    var s = parseFloat(document.getElementById("scale").value);

    var camX = parseFloat(document.getElementById("cameraX").value);
    var camY = parseFloat(document.getElementById("cameraY").value);
    var camZ = parseFloat(document.getElementById("cameraZ").value);

    var lookX = parseFloat(document.getElementById("lookAtX").value);
    var lookY = parseFloat(document.getElementById("lookAtY").value);
    var lookZ = parseFloat(document.getElementById("lookAtZ").value);

    box.position.set(tx, ty, tz);
    box.rotation.set(rx, ry, rz);
    box.scale.set(s, s, s);

    camera.position.set(camX, camY, camZ);

    lookAtPoint.set(lookX, lookY, lookZ);
    camera.lookAt(lookAtPoint);

    updateValue("txValue", tx);
    updateValue("tyValue", ty);
    updateValue("tzValue", tz);

    updateValue("rxValue", rx);
    updateValue("ryValue", ry);
    updateValue("rzValue", rz);

    updateValue("scaleValue", s);

    updateValue("camXValue", camX);
    updateValue("camYValue", camY);
    updateValue("camZValue", camZ);

    updateValue("lookXValue", lookX);
    updateValue("lookYValue", lookY);
    updateValue("lookZValue", lookZ);

    var ambientIntensity = parseFloat(document.getElementById("ambientLight").value);
    var directionalIntensity = parseFloat(document.getElementById("directionalLight").value);

    ambientLight.intensity = ambientIntensity;
    directionalLight.intensity = directionalIntensity;

    updateValue("ambientValue", ambientIntensity);
    updateValue("directionalValue", directionalIntensity);

    var boxColor = document.getElementById("boxColor").value;
    var planeColor = document.getElementById("planeColor").value;
    var ambientColor = document.getElementById("ambientColor").value;
    var directionalColor = document.getElementById("directionalColor").value;
    var backgroundColor = document.getElementById("backgroundColor").value;

    box.material.color.set(boxColor);
    plane.material.color.set(planeColor);

    ambientLight.color.set(ambientColor);
    directionalLight.color.set(directionalColor);

    renderer.setClearColor(backgroundColor);
    scene.fog.color.set(backgroundColor);
}

function updateValue(id, value) {
    document.getElementById(id).textContent = Number(value).toFixed(2);
}

function resetObject() {
    document.getElementById("translateX").value = 0;
    document.getElementById("translateY").value = 0.5;
    document.getElementById("translateZ").value = 0;

    document.getElementById("rotateX").value = 0;
    document.getElementById("rotateY").value = 0;
    document.getElementById("rotateZ").value = 0;

    document.getElementById("scale").value = 1;

    applyTransforms();
}

function resetCamera() {
    document.getElementById("cameraX").value = 3;
    document.getElementById("cameraY").value = 3;
    document.getElementById("cameraZ").value = 6;

    document.getElementById("lookAtX").value = 0;
    document.getElementById("lookAtY").value = 0;
    document.getElementById("lookAtZ").value = 0;

    applyTransforms();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function update() {
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}



init();
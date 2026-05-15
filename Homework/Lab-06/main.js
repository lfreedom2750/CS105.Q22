function init() {
	var scene = new THREE.Scene();
	var gui = new dat.GUI();

	// =====================
	// MATERIALS
	// =====================
	var sphereMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
	var planeMaterial = getMaterial('standard', 'rgb(255, 255, 255)');

	// =====================
	// OBJECTS
	// =====================
	var sphere = getSphere(sphereMaterial, 1, 32);
	var plane = getPlane(planeMaterial, 30);

	sphere.position.y = 1;
	plane.rotation.x = -Math.PI / 2;

	scene.add(sphere);
	scene.add(plane);

	// =====================
	// LIGHTS
	// =====================
	var lightLeft = getSpotLight(2, 'rgb(255, 220, 180)');
	var lightRight = getSpotLight(2, 'rgb(255, 220, 180)');
	var ambientLight = new THREE.AmbientLight(0xffffff, 0.35);

	lightLeft.position.set(-5, 5, -4);
	lightRight.position.set(5, 5, -4);

	scene.add(lightLeft);
	scene.add(lightRight);
	scene.add(ambientLight);

	// =====================
	// CUBEMAP BACKGROUND
	// =====================
	scene.background = new THREE.Color(0x87ceeb);

	var path = './assets/cubemap/';
	var format = '.jpg';

	var urls = [
		path + 'dark-s_px' + format,
		path + 'dark-s_nx' + format,
		path + 'dark-s_py' + format,
		path + 'dark-s_ny' + format,
		path + 'dark-s_pz' + format,
		path + 'dark-s_nz' + format
	];

	var reflectionCube = new THREE.CubeTextureLoader().load(
		urls,
		function(texture) {
			texture.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture;

			sphereMaterial.envMap = texture;
			planeMaterial.envMap = texture;

			sphereMaterial.needsUpdate = true;
			planeMaterial.needsUpdate = true;

			console.log('Cubemap loaded OK');
		},
		undefined,
		function(error) {
			console.log('Cubemap load failed. Using blue background.');
			scene.background = new THREE.Color(0x87ceeb);
		}
	);

	// =====================
	// TEXTURES
	// =====================
	var loader = new THREE.TextureLoader();

	var concreteTexture = loader.load('./assets/textures/concrete.jpg');
	var fingerprintTexture = loader.load('./assets/textures/fingerprints.jpg');

	concreteTexture.wrapS = THREE.RepeatWrapping;
	concreteTexture.wrapT = THREE.RepeatWrapping;
	concreteTexture.repeat.set(15, 15);

	planeMaterial.map = concreteTexture;
	planeMaterial.bumpMap = concreteTexture;
	planeMaterial.roughnessMap = concreteTexture;
	planeMaterial.bumpScale = 0.01;
	planeMaterial.metalness = 0.1;
	planeMaterial.roughness = 0.7;

	sphereMaterial.roughnessMap = fingerprintTexture;
	sphereMaterial.metalness = 0.8;
	sphereMaterial.roughness = 0.15;

	// =====================
	// GUI
	// =====================
	var folder1 = gui.addFolder('Left Light');
	folder1.add(lightLeft, 'intensity', 0, 10);
	folder1.add(lightLeft.position, 'x', -15, 15);
	folder1.add(lightLeft.position, 'y', 0, 15);
	folder1.add(lightLeft.position, 'z', -15, 15);

	var folder2 = gui.addFolder('Right Light');
	folder2.add(lightRight, 'intensity', 0, 10);
	folder2.add(lightRight.position, 'x', -15, 15);
	folder2.add(lightRight.position, 'y', 0, 15);
	folder2.add(lightRight.position, 'z', -15, 15);

	var folder3 = gui.addFolder('Materials');
	folder3.add(sphereMaterial, 'roughness', 0, 1);
	folder3.add(sphereMaterial, 'metalness', 0, 1);
	folder3.add(planeMaterial, 'roughness', 0, 1);
	folder3.add(planeMaterial, 'metalness', 0, 1);
	folder3.open();

	// =====================
	// CAMERA
	// =====================
	var camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	camera.position.set(0, 2, 8);
	camera.lookAt(0, 1, 0);

	// =====================
	// RENDERER
	// =====================
	var renderer = new THREE.WebGLRenderer({
		antialias: true
	});

	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setClearColor(0x87ceeb);
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	document.getElementById('webgl').appendChild(renderer.domElement);

	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;

	window.addEventListener('resize', function() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	update(renderer, scene, camera, controls);

	return scene;
}

function getMaterial(type, color) {
	var materialOptions = {
		color: color || 'rgb(255,255,255)'
	};

	switch(type) {
		case 'basic':
			return new THREE.MeshBasicMaterial(materialOptions);

		case 'lambert':
			return new THREE.MeshLambertMaterial(materialOptions);

		case 'phong':
			return new THREE.MeshPhongMaterial(materialOptions);

		case 'standard':
			return new THREE.MeshStandardMaterial(materialOptions);

		default:
			return new THREE.MeshBasicMaterial(materialOptions);
	}
}

function getSphere(material, size, segments) {
	var geometry = new THREE.SphereGeometry(size, segments, segments);
	var mesh = new THREE.Mesh(geometry, material);

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	return mesh;
}

function getPlane(material, size) {
	var geometry = new THREE.PlaneGeometry(size, size);

	material.side = THREE.DoubleSide;

	var mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;

	return mesh;
}

function getSpotLight(intensity, color) {
	color = color || 'rgb(255,255,255)';

	var light = new THREE.SpotLight(color, intensity);

	light.castShadow = true;
	light.penumbra = 0.5;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	light.shadow.bias = -0.001;

	return light;
}

function update(renderer, scene, camera, controls) {
	controls.update();
	renderer.render(scene, camera);

	requestAnimationFrame(function() {
		update(renderer, scene, camera, controls);
	});
}

var scene = init();
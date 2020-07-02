var scene = new THREE.Scene( );
scene.background = new THREE.Color(0xcce0ff);

//create the webgl renderer
var renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth,window.innerHeight);

//add the renderer to the current document
document.body.appendChild(renderer.domElement );

var ratio = window.innerWidth/window.innerHeight;

//Initialise camera
var camera = new THREE.PerspectiveCamera(45,ratio,0.00001,1000);
camera.position.set(0,20,100);
var Dir = new THREE.Vector3(0,0,1);
camera.lookAt(Dir.x,Dir.y,Dir.z);

//Initisalise controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI/2;
controls.minDistance = 35;
controls.maxDistance = 200;
controls.enablePan = false;
controls.update();
var particalSystem, particleCount, particles;
var mesh;
var container, stats;
var snowVelocity = 0;

//Add sun light
var sun_light = new THREE.DirectionalLight(0xffdeb8,1);
sun_light.position.set(-10,15,50);
sun_light.castShadow = true;
sun_light.shadow.camera = new THREE.OrthographicCamera( -40, 40, 40, -40, 1, 1000);
//var directionalLightHelper = new THREE.CameraHelper (sun_light.shadow.camera);
scene.add(sun_light);
//scene.add(directionalLightHelper);

//Add stage lights
var stage_light = new THREE.SpotLight(0x0000ff, 1, 40) //blue
stage_light.position.set(-20,12,10);
stage_light.castShadow = true;
//var spotLightHelper = new THREE.SpotLightHelper (stage_light);
//scene.add(spotLightHelper);
scene.add(stage_light);

var stage_light2 = new THREE.SpotLight(0xFF0000, 1, 40) //red
stage_light2.position.set(20,12,-5);
stage_light2.castShadow = true;
//var spotLightHelper2 = new THREE.SpotLightHelper (stage_light2);
//scene.add(spotLightHelper2);
scene.add(stage_light2);


var stage_light3 = new THREE.SpotLight(0x00FF00, 1, 40) //green
stage_light3.position.set(-20,12,-5);
stage_light3.castShadow = true;
//var spotLightHelper3 = new THREE.SpotLightHelper (stage_light3);
//scene.add(spotLightHelper3);
scene.add(stage_light3);

var stage_light4 = new THREE.SpotLight(0xFFFF00, 1, 40) //yellow
stage_light4.position.set(20,12,10);
stage_light4.castShadow = true;
//var spotLightHelper4 = new THREE.SpotLightHelper (stage_light4);
//scene.add(spotLightHelper4);
scene.add(stage_light4);


//Old godrays code
/*let Camera1Geo =  new THREE.CircleGeometry(.1,8);
let Camera1Mat = new THREE.MeshBasicMaterial( {color: 0x0000ff});
let Camera1 = new THREE.Mesh(Camera1Geo, Camera1Mat);
Camera1.position.set(-20,12,10);
Camera1.scale.setX(.1);
scene.add(Camera1);

let CameraRay = new POSTPROCESSING.GodRaysEffect(camera, Camera1, {
  resolutionScale: 1,
  density: 0.8,
  decay: 0.95,
  weight: 0.9,
  samples: 100
});
let renderPass = new POSTPROCESSING.RenderPass(scene, camera);
let effectPass = new POSTPROCESSING.EffectPass(camera,CameraRay);
effectPass.renderToScreen = true;
composer = new POSTPROCESSING.EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(effectPass);*/

init();
initSky();

//initialise snow textures
function init() {
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  //scene.fog = new THREE.FogExp2(0xcce0ff, 0.002, 1000);
  particleCount = 15000;
  var pMaterial = new THREE.PointCloudMaterial({
    color:  0xFFFFFF,
    size: 2,
    map: loader.load('textures/snow.png'),
blending: THREE.AdditiveBlending,
depthTest: false,
transparent: true
});

//Snow particle system
particles = new THREE.Geometry;
    for (var i = 0; i < particleCount; i++) {
        var pX = Math.random()*500 - 250,
            pY = Math.random()*500 - 250,
            pZ = Math.random()*500 - 250,
            particle = new THREE.Vector3(pX, pY, pZ);
        particle.velocity = {};
        particle.velocity.y = 0;
        particles.vertices.push(particle);
    }
    particleSystem = new THREE.PointCloud(particles, pMaterial);
    scene.add(particleSystem);
}

var sky, sunSphere;
//Create sky shader
function initSky() {

				// Add Sky
				sky = new Sky();
				sky.scale.setScalar( 450000 );
				scene.add( sky );

				// Add Sun Helper
				sunSphere = new THREE.Mesh(
					new THREE.SphereBufferGeometry( 20000, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
				);
				sunSphere.position.y = - 700000;
				sunSphere.visible = true;
				scene.add( sunSphere );

				var distance = 400000;

        var uniforms = sky.material.uniforms;
					uniforms[ "turbidity" ].value = 10;
					uniforms[ "rayleigh" ].value = 2;
					uniforms[ "mieCoefficient" ].value = 0.005;
					uniforms[ "mieDirectionalG" ].value = 0.8;
					uniforms[ "luminance" ].value = 0.1;

          var inclination = 0.49;
          var azimuth = 0.8;

          var theta = Math.PI * ( inclination - 0.5 );
					var phi = 2 * Math.PI * ( azimuth - 0.5 );

					sunSphere.position.x = distance * Math.cos( phi );
					sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
					sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

					sunSphere.visible = true;

					uniforms[ "sunPosition" ].value.copy( sunSphere.position );

			}

//Generate snow
function simulateRain() {
  var pCount = particleCount;
  while (pCount--) {
  var particle = particles.vertices[pCount];
  if (particle.y < -200) {
    particle.y = 200;
    particle.velocity.y = 0;
  }
  particle.velocity.y -= Math.random() * snowVelocity;
  particle.y += particle.velocity.y;
  }
  particles.verticesNeedUpdate = true;
};


//loader function
var loader = new THREE.GLTFLoader();
loader.load('/models/Stage/stage.gltf', handle_load);
var mesh_stage;
//stage loader
function handle_load(gltf){
  gltf.scene.traverse(function (child){
    if (child.isMesh){
      child.castShadow = true;
    }
  });

  mesh_stage = gltf.scene;
  scene.add(mesh_stage);
  mesh_stage.position.y = -5.5;
  mesh_stage.rotation.y = Math.PI/2;
  mesh_stage.rotation.y -= -Math.PI/2;
}
loader.load('/models/Drums/drums.gltf', handle_drum);
var mesh_drums;
//drums loader
function handle_drum(gltf){
  gltf.scene.traverse(function (child){
    if (child.isMesh){
      child.castShadow = true;
    }
  });

  mesh_drums = gltf.scene;
  scene.add(mesh_drums);
  mesh_drums.scale.set(0.003,0.003,0.003);
  mesh_drums.position.x = 3;
  mesh_drums.position.y = 0.38+0.1;

}
loader.load('models/Guitar/guitar.gltf', handle_guitar);
var mesh_guitar;
//guitar loader
function handle_guitar(gltf){
  gltf.scene.traverse(function (child){
    if (child.isMesh){
      child.castShadow = true;
    }
  });

  mesh_guitar = gltf.scene;
  scene.add(mesh_guitar);
  mesh_guitar.scale.set(0.7,0.7,0.7);
  mesh_guitar.position.y = 0.38+0.1;
  mesh_guitar.rotation.y = Math.PI/2;
  mesh_guitar.position.x = -13;
}
loader.load('models/Keyboard/keys.gltf', handle_keyboard);
var mesh_keys;
//keyboard loader
function handle_keyboard(gltf){
  gltf.scene.traverse(function (child){
    if (child.isMesh){
      child.castShadow = true;
    }
  });

  mesh_keys = gltf.scene;
  scene.add(mesh_keys);
  mesh_keys.scale.set(0.01,0.01,0.01);
  mesh_keys.position.y = 0.38+.1;
  mesh_keys.position.x = 13;
  mesh_keys.rotation.y -= -Math.PI/3;
  mesh_keys.rotation.y += Math.PI/3;
}
loader.load('models/Bass Guitar/bass_guitar.gltf', handle_bass);
var mesh_bass;
//bass guitar loader
function handle_bass(gltf){
  gltf.scene.traverse(function (child){
    if (child.isMesh){
      child.castShadow = true;
    }
  });

  mesh_bass = gltf.scene;
  scene.add(mesh_bass);
  mesh_bass.scale.set(2,2,2);
  mesh_bass.rotation.x = Math.PI/2;
  mesh_bass.rotation.y = Math.PI/2;
  mesh_bass.position.set(-8,0.38+0.1,-3);
}

    var fftSize = 32;
    var listener = new THREE.AudioListener();

    //Create listeners for the audio clips
    guitar_audio1 = new THREE.Audio( listener );
    guitar_audio2 = new THREE.Audio( listener );
    guitar_audio3 = new THREE.Audio( listener );
    keys_audio1 = new THREE.Audio( listener );
    keys_audio2 = new THREE.Audio( listener );
    keys_audio3 = new THREE.Audio( listener );
    bass_audio1 = new THREE.Audio( listener );
    bass_audio2 = new THREE.Audio( listener );
    bass_audio3 = new THREE.Audio( listener );
    drums_audio1 = new THREE.Audio( listener );
    drums_audio2 = new THREE.Audio( listener );
    drums_audio3 = new THREE.Audio( listener );

    //Initialise the audio clips
    var playing = false;
    function initMusic(){
      playing = true;
    var guitar1 = new THREE.AudioLoader();
    guitar1.load( 'sounds/Guitar1.mp3', function( buffer ) {
       guitar_audio1.setBuffer( buffer );
        guitar_audio1.setLoop(true);
         guitar_audio1.setVolume(1);
          guitar_audio1.play();
    });
    var guitar2 = new THREE.AudioLoader();
    guitar2.load( 'sounds/Guitar2.mp3', function( buffer ) {
       guitar_audio2.setBuffer( buffer );
        guitar_audio2.setLoop(true);
         guitar_audio2.setVolume(0);
          guitar_audio2.play();
    });
    var guitar3 = new THREE.AudioLoader();
    guitar3.load( 'sounds/Guitar3.mp3', function( buffer ) {
       guitar_audio3.setBuffer( buffer );
        guitar_audio3.setLoop(true);
         guitar_audio3.setVolume(0);
          guitar_audio3.play();
    });

    var keys1 = new THREE.AudioLoader();
    keys1.load( 'sounds/Keys1.mp3', function( buffer ) {
       keys_audio1.setBuffer( buffer );
        keys_audio1.setLoop(true);
         keys_audio1.setVolume(1);
          keys_audio1.play();
    });
    var keys2 = new THREE.AudioLoader();
    keys2.load( 'sounds/Keys2.mp3', function( buffer ) {
       keys_audio2.setBuffer( buffer );
        keys_audio2.setLoop(true);
         keys_audio2.setVolume(0);
          keys_audio2.play();
    });
    var keys3 = new THREE.AudioLoader();
    keys3.load( 'sounds/Keys3.mp3', function( buffer ) {
       keys_audio3.setBuffer( buffer );
        keys_audio3.setLoop(true);
         keys_audio3.setVolume(0);
          keys_audio3.play();
    });


    var bass1 = new THREE.AudioLoader();
    bass1.load( 'sounds/Bass1.mp3', function( buffer ) {
       bass_audio1.setBuffer( buffer );
        bass_audio1.setLoop(true);
         bass_audio1.setVolume(1);
          bass_audio1.play();
    });
    var bass2 = new THREE.AudioLoader();
    bass2.load( 'sounds/Bass2.mp3', function( buffer ) {
       bass_audio2.setBuffer( buffer );
        bass_audio2.setLoop(true);
         bass_audio2.setVolume(0);
          bass_audio2.play();
    });
    var bass3 = new THREE.AudioLoader();
    bass3.load( 'sounds/Bass3.mp3', function( buffer ) {
       bass_audio3.setBuffer( buffer );
        bass_audio3.setLoop(true);
         bass_audio3.setVolume(0);
          bass_audio3.play();
    });

    var drums1 = new THREE.AudioLoader();
    drums1.load( 'sounds/Drums1.mp3', function( buffer ) {
       drums_audio1.setBuffer( buffer );
        drums_audio1.setLoop(true);
         drums_audio1.setVolume(1);
          drums_audio1.play();
    });
    var drums2 = new THREE.AudioLoader();
    drums2.load( 'sounds/Drums2.mp3', function( buffer ) {
       drums_audio2.setBuffer( buffer );
        drums_audio2.setLoop(true);
         drums_audio2.setVolume(0);
          drums_audio2.play();
    });
    var drums3 = new THREE.AudioLoader();
    drums3.load( 'sounds/Drums3.mp3', function( buffer ) {
       drums_audio3.setBuffer( buffer );
        drums_audio3.setLoop(true);
         drums_audio3.setVolume(0);
          drums_audio3.play();
    });

    //Create analysers for each audio clip
    guitar_analyser1 = new THREE.AudioAnalyser( guitar_audio1, fftSize );
    guitar_analyser1.analyser.smoothingTimeConstant=0.9;
    guitar_analyser2 = new THREE.AudioAnalyser( guitar_audio2, fftSize );
    guitar_analyser2.analyser.smoothingTimeConstant=0.9;
    guitar_analyser3 = new THREE.AudioAnalyser( guitar_audio3, fftSize );
    guitar_analyser3.analyser.smoothingTimeConstant=0.9;

    keys_analyser1 = new THREE.AudioAnalyser( keys_audio1, fftSize );
    keys_analyser1.analyser.smoothingTimeConstant=0.9;
    keys_analyser2 = new THREE.AudioAnalyser( keys_audio2, fftSize );
    keys_analyser2.analyser.smoothingTimeConstant=0.9;
    keys_analyser3 = new THREE.AudioAnalyser( keys_audio3, fftSize );
    keys_analyser3.analyser.smoothingTimeConstant=0.9;

    bass_analyser1 = new THREE.AudioAnalyser( bass_audio1, fftSize );
    bass_analyser1.analyser.smoothingTimeConstant=0.9;
    bass_analyser2 = new THREE.AudioAnalyser( bass_audio2, fftSize );
    bass_analyser2.analyser.smoothingTimeConstant=0.9;
    bass_analyser3 = new THREE.AudioAnalyser( bass_audio3, fftSize );
    bass_analyser3.analyser.smoothingTimeConstant=0.9;

    drums_analyser1 = new THREE.AudioAnalyser( drums_audio1, fftSize );
    drums_analyser1.analyser.smoothingTimeConstant=0.9;
    drums_analyser2 = new THREE.AudioAnalyser( drums_audio2, fftSize );
    drums_analyser2.analyser.smoothingTimeConstant=0.9;
    drums_analyser3 = new THREE.AudioAnalyser( drums_audio3, fftSize );
    drums_analyser3.analyser.smoothingTimeConstant=0.9;
  }
    //analyser.data[2] or analyser.data[3] good for bass



//ground texture for the grass
var texture = new THREE.TextureLoader().load('textures/grassground.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1000,1000);

//Initialise grass
var floorMaterial = new THREE.MeshPhongMaterial();
floorMaterial.map = texture;
floorMaterial.side = THREE.DoubleSide;
floorMaterial.shininess = 0;
var floorGeometry = new THREE.PlaneGeometry(20000, 20000);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -4.97;
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;
floor.castShadow = false;
scene.add(floor);

//Initailise stage floor
var stageFloorMaterial = new THREE.MeshPhongMaterial();
stageFloorMaterial.color = new THREE.Color(1,1,1);
stageFloorMaterial.side = THREE.DoubleSide;
var stageFloorGeometry = new THREE.PlaneGeometry(41.6, 25.8);
var stageFloor = new THREE.Mesh(stageFloorGeometry, stageFloorMaterial);
stageFloor.rotation.x = Math.PI / 2;
stageFloor.position.x = -0.25;
stageFloor.position.y = 0.38;
stageFloor.position.z = 3.8;
stageFloor.receiveShadow = true;
stageFloor.castShadow = false;
scene.add(stageFloor);

//loop passing through every frame
  var MyUpdateLoop = function(){

    //When the meshes are loaded, load the audio
    if(mesh_guitar!=null && mesh_keys!=null && mesh_bass!=null && mesh_drums!=null && mesh_stage!=null && !playing){
      initMusic();
    }
    //If audio is playing, perform audio visualisation
    if(playing){
    guitar_analyser1.getFrequencyData();
    guitar_analyser2.getFrequencyData();
    guitar_analyser3.getFrequencyData();
    keys_analyser1.getFrequencyData();
    keys_analyser2.getFrequencyData();
    keys_analyser3.getFrequencyData();
    bass_analyser1.getFrequencyData();
    bass_analyser2.getFrequencyData();
    bass_analyser3.getFrequencyData();
    drums_analyser1.getFrequencyData();
    drums_analyser2.getFrequencyData();
    drums_analyser3.getFrequencyData();

    var guitar_response = guitar_analyser1.data[3] + guitar_analyser2.data[3] + guitar_analyser3.data[3];
    var keys_response = keys_analyser1.data[3] + keys_analyser2.data[3] + keys_analyser3.data[3];
    var bass_response = bass_analyser1.data[2] + bass_analyser2.data[2] + bass_analyser3.data[2];
    var drums_response = drums_analyser1.data[3] + drums_analyser2.data[3] + drums_analyser3.data[3];

    if(guitar_response>=1 && mesh_guitar!=null){
      mesh_guitar.scale.x = 1.5 * guitar_response/256;
      mesh_guitar.scale.y = 1.5 * guitar_response/256;
      mesh_guitar.scale.z = 1.5 * guitar_response/256;
      stage_light.intensity = (guitar_response/256)*0.5+guitar_response/256;
    }

    if(keys_response>=1 && mesh_keys!=null){
      mesh_keys.scale.x = 0.02 * keys_response/256;
      mesh_keys.scale.y = 0.02 * keys_response/256;
      mesh_keys.scale.z = 0.02 * keys_response/256;
      stage_light2.intensity = (keys_response/256)*0.6+keys_response/256;

    }

    if(bass_response>=1 && mesh_bass!=null){
      mesh_bass.scale.x = 3 * bass_response/256;
      mesh_bass.scale.y = 3 * bass_response/256;
      mesh_bass.scale.z = 3 * bass_response/256;
      stage_light3.intensity = (bass_response/256)*0.3+bass_response/256;
    }

    if(drums_response>=1 && mesh_drums!=null){
      mesh_drums.scale.x = 0.007 * drums_response/256;
      mesh_drums.scale.y = 0.007 * drums_response/256;
      mesh_drums.scale.z = 0.007 * drums_response/256;
      stage_light4.intensity = (drums_response/256)*0.4+drums_response/256;
      snowVelocity = 0.02 * drums_response/256;
    }
  }

    //Update snow
    particleSystem.rotation.y += 0.01;
    simulateRain();
    render();
    requestAnimationFrame(MyUpdateLoop);
  }
requestAnimationFrame(MyUpdateLoop);

//Create the GUI
var gui;
function buildGUI(){
  gui = new dat.GUI();
  var params = {
    master_volume : listener.getMasterVolume(),
    guitar_volume : guitar_audio1.getVolume(),
    guitar_choice : '1',
    keys_volume : keys_audio1.getVolume(),
    keys_choice : '1',
    bass_volume : bass_audio1.getVolume(),
    bass_choice : '1',
    drums_volume : drums_audio1.getVolume(),
    drums_choice : '1'
  };

  gui.add(params, 'master_volume',0,1).onChange(function(val){
    listener.setMasterVolume(val);
  }).name('Master Volume');

  gui.add(params, 'guitar_choice',['1','2','3']).onChange(function(val){
    switch(val){
      case '1': guitar_audio1.setVolume(params.guitar_volume);guitar_audio2.setVolume(0);guitar_audio3.setVolume(0);break;
      case '2': guitar_audio1.setVolume(0);guitar_audio2.setVolume(params.guitar_volume);guitar_audio3.setVolume(0);break;
      case '3': guitar_audio1.setVolume(0);guitar_audio2.setVolume(0);guitar_audio3.setVolume(params.guitar_volume);break;
    }
  }).name('Guitar Pattern');

  gui.add(params, 'guitar_volume',0,1).onChange(function(val){
    switch(params.guitar_choice){
      case '1': guitar_audio1.setVolume(val); break;
      case '2': guitar_audio2.setVolume(val); break;
      case '3': guitar_audio3.setVolume(val); break;
    }
  }).name('Guitar Volume');

  gui.add(params, 'keys_choice',['1','2','3']).onChange(function(val){
    switch(val){
      case '1': keys_audio1.setVolume(params.keys_volume);keys_audio2.setVolume(0);keys_audio3.setVolume(0);break;
      case '2': keys_audio1.setVolume(0);keys_audio2.setVolume(params.keys_volume);keys_audio3.setVolume(0);break;
      case '3': keys_audio1.setVolume(0);keys_audio2.setVolume(0);keys_audio3.setVolume(params.keys_volume);break;
    }
  }).name('Keys Pattern');
  gui.add(params, 'keys_volume',0,1).onChange(function(val){
    switch(params.keys_choice){
      case '1': keys_audio1.setVolume(val); break;
      case '2': keys_audio2.setVolume(val); break;
      case '3': keys_audio3.setVolume(val); break;
    }
  }).name('Keys Volume');

  gui.add(params, 'bass_choice',['1','2','3']).onChange(function(val){
    switch(val){
      case '1': bass_audio1.setVolume(params.bass_volume);bass_audio2.setVolume(0);bass_audio3.setVolume(0);break;
      case '2': bass_audio1.setVolume(0);bass_audio2.setVolume(params.bass_volume);bass_audio3.setVolume(0);break;
      case '3': bass_audio1.setVolume(0);bass_audio2.setVolume(0);bass_audio3.setVolume(params.bass_volume);break;
    }
  }).name('Bass Pattern');
  gui.add(params, 'bass_volume',0,1).onChange(function(val){
    switch(params.bass_choice){
      case '1': bass_audio1.setVolume(val); break;
      case '2': bass_audio2.setVolume(val); break;
      case '3': bass_audio3.setVolume(val); break;
    }
  }).name('Bass Volume');

  gui.add(params, 'drums_choice',['1','2','3']).onChange(function(val){
    switch(val){
      case '1': drums_audio1.setVolume(params.drums_volume);drums_audio2.setVolume(0);drums_audio3.setVolume(0);break;
      case '2': drums_audio1.setVolume(0);drums_audio2.setVolume(params.drums_volume);drums_audio3.setVolume(0);break;
      case '3': drums_audio1.setVolume(0);drums_audio2.setVolume(0);drums_audio3.setVolume(params.drums_volume);break;
    }
  }).name('Drum Pattern');
  gui.add(params, 'drums_volume',0,1).onChange(function(val){
    switch(params.drums_choice){
      case '1': drums_audio1.setVolume(val); break;
      case '2': drums_audio2.setVolume(val); break;
      case '3': drums_audio3.setVolume(val); break;
    }
  }).name('Drums Volume');

  gui.open();
}
  buildGUI();

  function render() {
    renderer.render(scene,camera);
  }

//this function is called when the window is resized
var MyResize = function ( )
{
  //get the new sizes
  var width = window.innerWidth;
  var height = window.innerHeight;
  //then update the renderer
  renderer.setSize(width,height);
  //and update the aspect ratio of the camera
  camera.aspect = width/height;
  //update the projection matrix given the new values
  camera.updateProjectionMatrix();
  //and finally render the scene again
  render();
};

render();
//link the resize of the window to the update of the camera
window.addEventListener('resize', MyResize);

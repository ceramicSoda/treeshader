import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { leavesVS, leavesFS } from "./leavesShader.js"
import './style.css';
// GENERAL DEFINITIONS
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);
const dummy = new THREE.Object3D();
const matrix = new THREE.Matrix4();
const pointer = new THREE.Vector2(); 
const raycaster = new THREE.Raycaster();
const dlight01 = new THREE.DirectionalLight(0xcccccc, 1.8);
const tree = {group: new THREE.Group()};
const noiseMap = new THREE.TextureLoader().load('assets/noise.png');
const rayPlane = new THREE.Mesh(new THREE.PlaneGeometry(100,100,1,1), undefined);
// MATERIALS
const leavesMat = new THREE.ShaderMaterial({
  lights: true,
  side: THREE.DoubleSide,
  uniforms: {
    ...THREE.UniformsLib.lights,
    uTime: {value: 0.},
    //uColorA: {value: new THREE.Color(0x933212)},
    uColorA: {value: new THREE.Color(0xb45252)},
    //uColorB: {value: new THREE.Color(0xc45841)},
    uColorB: {value: new THREE.Color(0xd3a068)},
    //uColorC: {value: new THREE.Color(0xf5c465)},
    uColorC: {value: new THREE.Color(0xede19e)},
    uBoxMin: {value: new THREE.Vector3(0,0,0)},
    uBoxSize: {value: new THREE.Vector3(10,10,10)},
    uRaycast: {value: new THREE.Vector3(0,0,0)},
    uNoiseMap: {value: noiseMap},
  },
  vertexShader: leavesVS,
  fragmentShader: leavesFS,
})
// GLTF LOADING 
loader.loadAsync("assets/__old/tree_high.glb")
.catch(err => console.error(err))
.then(obj => {
  tree.pole = obj.scene.getObjectByName("Pole");
  tree.pole.material = new THREE.MeshToonMaterial({map: tree.pole.material.map});
  // Each vertex of crown mesh will be a leaf
  // Crown mesh won't be visible in scene
  tree.crown = obj.scene.getObjectByName("Leaves");
  // For object space shader
  tree.bbox = new THREE.Box3().setFromObject(tree.crown);
  leavesMat.uniforms.uBoxMin.value.copy(tree.bbox.min); 
  leavesMat.uniforms.uBoxSize.value.copy(tree.bbox.getSize(new THREE.Vector3())); 
  tree.leavesCount = tree.crown.geometry.attributes.position.count;
  tree.whenDied = new Array(tree.leavesCount);
  tree.deadID = []; 
  tree.leafGeometry = obj.scene.getObjectByName("Leaf").geometry; 
  tree.leaves = new THREE.InstancedMesh(tree.leafGeometry, leavesMat, tree.leavesCount); 
  for (let i = 0; i < tree.leavesCount; i++) { 
    dummy.position.x = tree.crown.geometry.attributes.position.array[i*3];
    dummy.position.y = tree.crown.geometry.attributes.position.array[i*3+1];
    dummy.position.z = tree.crown.geometry.attributes.position.array[i*3+2];
    dummy.lookAt(dummy.position.x + tree.crown.geometry.attributes.normal.array[i*3],
                 dummy.position.y + tree.crown.geometry.attributes.normal.array[i*3+1],
                 dummy.position.z + tree.crown.geometry.attributes.normal.array[i*3+2]);
    dummy.scale.x = (Math.random() * 0.2 + 0.8);
    dummy.scale.y = (Math.random() * 0.2 + 0.8);
    dummy.scale.z = (Math.random() * 0.2 + 0.8);
    dummy.updateMatrix();
    tree.leaves.setMatrixAt(i, dummy.matrix);
  }
  tree.group.add(tree.pole, tree.leaves);
  for (let i = 0; i < 16; i++)
    tree.deadID.push(Math.floor(Math.random() * tree.leavesCount)); 
})
// INIT
document.body.appendChild(renderer.domElement); 
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
dlight01.position.set(3,6,-3);
dlight01.lookAt(0,2.4,0);
rayPlane.visible = false;
camera.position.set(-7,1,-12);
controls.target = new THREE.Vector3(0,2.4,0);
controls.maxPolarAngle = Math.PI * 0.5; 
controls.enableDamping = true;
controls.autoRotate = true;
controls.enablePan = false;
controls.touches = {TWO: THREE.TOUCH.ROTATE,};
scene.add(dlight01, tree.group, rayPlane);
noiseMap.wrapS = THREE.RepeatWrapping;
noiseMap.wrapT = THREE.RepeatWrapping;
// MAIN LOOP
function animate () {
  leavesMat.uniforms.uTime.value += 0.01; 

  if (tree.deadID){
    tree.deadID = tree.deadID.map(i => {
      tree.leaves.getMatrixAt(i, matrix);
      matrix.decompose(dummy.position, dummy.rotation, dummy.scale);
      if (dummy.position.y > 0) {
        dummy.position.y -= 0.04;
        dummy.position.x += Math.random()/5 - 0.11;
        dummy.position.z += Math.random()/5 - 0.11;
        dummy.rotation.x += 0.2;
        dummy.updateMatrix();
        tree.leaves.setMatrixAt(i, dummy.matrix);
        return(i);
      }
    })
    tree.leaves.instanceMatrix.needsUpdate = true; 
  } 

  controls.update(); 
  renderer.render(scene, camera); 
}
// EVENTS
window.addEventListener("resize", () => {
  camera.aspect = document.body.clientWidth / document.body.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( document.body.clientWidth, document.body.clientHeight );
})
document.addEventListener("mousemove", (e) => pointerMove(e))
document.addEventListener("touchmove", (e) => pointerMove(e))
// MISC
killRandom();
function killRandom() {
  if (tree.deadID)
    tree.deadID.push(Math.floor(Math.random() * tree.leavesCount)); 
  setTimeout(killRandom, Math.random() * 1500);
}
function pointerMove(e) {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1,
              -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects([tree.leaves, rayPlane]);
  if (intersects[0]){
    // for smooth transition between background and tree
    rayPlane.position.copy(intersects[0].point);
    rayPlane.position.multiplyScalar(0.9);
    rayPlane.lookAt(camera.position);
    leavesMat.uniforms.uRaycast.value = intersects[0].point;
    if (Math.random()*5 > 3)
      tree.deadID.push(intersects[0].instanceId);
  }
  else
    leavesMat.uniforms.uRaycast.value = new THREE.Vector3(99,99,99);
}

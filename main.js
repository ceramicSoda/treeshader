import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { leavesVS, leavesFS } from "./leavesShader.js"
import './style.css';
// GENERAL DEFINITIONS
const scene = new THREE.Scene();
// Sun :P
const test = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({color: 0xffffef}));
const loader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);
const dlight01 = new THREE.DirectionalLight(0xcccccc, 1.8);
const tree = {group: new THREE.Group()};
const noiseMap = new THREE.TextureLoader().load('assets/noise.png');
// MATERIALS
const leavesMat = new THREE.ShaderMaterial({
  lights: true,
  side: THREE.DoubleSide,
  uniforms: {
    ...THREE.UniformsLib.lights,
    uTime: {value: 0.},
    uColorA: {value: new THREE.Color(0x933212)},
    uColorB: {value: new THREE.Color(0xc7381a)},
    uColorC: {value: new THREE.Color(0xf5c465)},
    uBoxMin: {value: new THREE.Vector3(0,0,0)},
    uBoxSize: {value: new THREE.Vector3(10,10,10)},
    uNoiseMap: {value: noiseMap},
  },
  vertexShader: leavesVS,
  fragmentShader: leavesFS,
})
// GLTF LOADING 
loader.loadAsync("assets/tree_flat___backup.glb")
.catch(err => console.error(err))
.then(obj => {
  tree.pole = obj.scene.getObjectByName("Pole");
  tree.pole.material = new THREE.MeshBasicMaterial({map: tree.pole.material.map});
  // Each vertex of crown mesh will be a leaf
  // Crown mesh won't be visible in scene
  tree.crown = obj.scene.getObjectByName("Leaves");
  // For object space shader
  tree.bbox = new THREE.Box3().setFromObject(tree.crown);
  leavesMat.uniforms.uBoxMin.value.copy(tree.bbox.min); 
  leavesMat.uniforms.uBoxSize.value.copy(tree.bbox.getSize(new THREE.Vector3())); 
  tree.leavesCount = tree.crown.geometry.attributes.position.count;
  tree.leafGeometry = obj.scene.getObjectByName("Leaf").geometry; 
  console.log(tree.leavesCount);
  tree.leaves = new THREE.InstancedMesh(tree.leafGeometry, leavesMat, tree.leavesCount); 
  console.log(tree.leaves); 
  const dummy = new THREE.Object3D();
  for (let i = 0; i < tree.leavesCount; i++) { 
    dummy.position.x = tree.crown.geometry.attributes.position.array[i*3];
    dummy.position.y = tree.crown.geometry.attributes.position.array[i*3+1];
    dummy.position.z = tree.crown.geometry.attributes.position.array[i*3+2];
    dummy.lookAt(dummy.position.x + tree.crown.geometry.attributes.normal.array[i*3],
                 dummy.position.y + tree.crown.geometry.attributes.normal.array[i*3+1],
                 dummy.position.z + tree.crown.geometry.attributes.normal.array[i*3+2]);
    dummy.scale.x = (Math.random() * 0.4 + 0.8);
    dummy.scale.y = (Math.random() * 0.4 + 0.8);
    dummy.scale.z = (Math.random() * 0.4 + 0.8);
    dummy.updateMatrix();
    tree.leaves.setMatrixAt(i, dummy.matrix);
  }
  tree.group.add(tree.pole, tree.leaves);
})
// INIT
document.body.appendChild(renderer.domElement); 
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
dlight01.position.set(3,8,-3);
dlight01.lookAt(0,2.4,0);
camera.position.set(-6,1,-10);
controls.target = new THREE.Vector3(0,2.4,0);
controls.maxPolarAngle = Math.PI * 0.6; 
controls.enableDamping = true;
controls.enablePan = false;
controls.autoRotate = true;
test.position.copy(dlight01.position);
scene.add(dlight01, tree.group, test);
noiseMap.wrapS = THREE.RepeatWrapping;
noiseMap.wrapT = THREE.RepeatWrapping;
// MAIN LOOP
function animate () {
  leavesMat.uniforms.uTime.value += 0.01; 
  controls.update(); 
  renderer.render(scene, camera); 
}
// EVENTS
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})
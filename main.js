import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { leavesVS, leavesFS } from "./leavesShader.js"
import './style.css';
// GENERAL DEFINITIONS
const scene = new THREE.Scene();
const test = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial({color: 0xfa8023, shininess: 100, specular: 100}));
const loader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);
const dlight01 = new THREE.DirectionalLight(0xcccccc, 0.8);
const tree = {group: new THREE.Group()};
// MATERIALS
const leavesMat = new THREE.ShaderMaterial({
  lights: true,
  side: THREE.DoubleSide,
  uniforms: {
    ...THREE.UniformsLib.lights,
    uTime: {value: 0.},
    uColor: {value: new THREE.Color(0xe5752b)},
    uBoxMin: {value: new THREE.Vector3(0,0,0)},
    uBoxSize: {value: new THREE.Vector3(10,10,10)},
  },
  vertexShader: leavesVS,
  fragmentShader: leavesFS,
})
// GLTF LOADING 
loader.loadAsync("assets/tree_flat.glb")
.catch(err => console.error(err))
.then(obj => {
  tree.pole = obj.scene.getObjectByName("Pole");
  tree.pole.material = new THREE.MeshBasicMaterial({color: 0xc4a5b4});
  // Each vertex of crown mesh will be a leaf
  // Crown mesh won't be visible in scene
  tree.crown = obj.scene.getObjectByName("Leaves");
  // For object space shader
  tree.bbox = new THREE.Box3().setFromObject(tree.crown);
  leavesMat.uniforms.uBoxMin.value.copy(tree.bbox.min); 
  leavesMat.uniforms.uBoxSize.value.copy(tree.bbox.getSize(new THREE.Vector3())); 
  
  tree.leavesCount = tree.crown.geometry.attributes.position.count;
  tree.leafGeometry = obj.scene.getObjectByName("Leaf").geometry; 
  tree.leaves = new THREE.InstancedMesh(tree.leafGeometry, leavesMat, tree.leavesCount); 
  const dummy = new THREE.Object3D();
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
})
// INIT
document.body.appendChild(renderer.domElement); 
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
dlight01.position.set(3,8,-3);
dlight01.lookAt(0,2.4,0);
camera.position.set(12,4,0);
controls.target = new THREE.Vector3(0,2.4,0);
scene.add(dlight01, tree.group);
// MAIN LOOP
function animate () {
  controls.update(); 
  renderer.render(scene, camera); 
}
// EVENTS
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})
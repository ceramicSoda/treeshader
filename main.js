import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { leavesVS, leavesFS } from "./leavesShader.js"
import './style.css';
//-----------------------------THREE 
const scene = new THREE.Scene();
const test = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial({color: 0xfa8023, shininess: 100, specular: 100}));
const loader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);
const dlight01 = new THREE.DirectionalLight(0xcccccc, 0.8);
const tree = {group: new THREE.Group()};
//-----------------------------MATERIALS
const leavesMat = new THREE.ShaderMaterial({
  lights: true,
  uniforms: {
    ...THREE.UniformsLib.lights,
    uColor: {value: new THREE.Color(0xDA9030)},
  },
  vertexShader: leavesVS,
  fragmentShader: leavesFS,
})
//-----------------------------GLTF
loader.loadAsync("assets/tree.glb")
.catch(err => console.error(err))
.then(obj => {
  tree.pole = obj.scene.getObjectByName("Pole");
  tree.leaves = obj.scene.getObjectByName("Leaves");
  tree.group.add(tree.pole, tree.leaves);
})

//-----------------------------INIT
document.body.appendChild(renderer.domElement); 
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
dlight01.position.set(4,2,0);
dlight01.lookAt(0,0,0);
camera.position.set(4,2,0);
camera.lookAt(0,0,0);
scene.add(dlight01, tree.group);
//-----------------------------LOOP
function animate () {
  controls.update(); 
  renderer.render(scene, camera); 
}
//------------------------------RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})
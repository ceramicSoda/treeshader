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
  side: THREE.DoubleSide,
  uniforms: {
    ...THREE.UniformsLib.lights,
    uColor: {value: new THREE.Color(0xe5752b)},
  },
  vertexShader: leavesVS,
  fragmentShader: leavesFS,
})
//-----------------------------GLTF
loader.loadAsync("assets/tree_new.glb")
.catch(err => console.error(err))
.then(obj => {
  tree.pole = obj.scene.getObjectByName("Pole");
  tree.pole.material = new THREE.MeshBasicMaterial({color: 0xc4a5b4});
  tree.crown = obj.scene.getObjectByName("Leaves");
  tree.leavesCount = tree.crown.geometry.attributes.position.count;
  tree.leafGeometry = obj.scene.getObjectByName("Leaf").geometry; 
  console.log(tree.leavesCount);
  //tree.leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.1, 0.15,4,4), new THREE.MeshPhongMaterial({color: 0xF4CF74}), tree.leavesCount); 
  tree.leaves = new THREE.InstancedMesh(tree.leafGeometry, 
                                        //new THREE.MeshBasicMaterial({color: 0xe5752b, side: THREE.DoubleSide}), 
                                        leavesMat,
                                        tree.leavesCount); 
  const dummy = new THREE.Object3D();
  for (let i = 0; i < tree.leavesCount; i++) { 
    dummy.position.x = tree.crown.geometry.attributes.position.array[i*3];
    dummy.position.y = tree.crown.geometry.attributes.position.array[i*3+1];
    dummy.position.z = tree.crown.geometry.attributes.position.array[i*3+2];
    
    dummy.rotation.x = Math.random() * 0.1;
    dummy.rotation.y = Math.random() * 0.1;
    dummy.rotation.z = Math.random() * 0.1;

    dummy.lookAt(dummy.position.x + tree.crown.geometry.attributes.normal.array[i*3],
                 dummy.position.y + tree.crown.geometry.attributes.normal.array[i*3+1],
                 dummy.position.z + tree.crown.geometry.attributes.normal.array[i*3+2]);
    dummy.scale.x = (Math.random() * 0.4 + 0.6);
    dummy.scale.y = (Math.random() * 0.4 + 0.6);
    dummy.scale.z = (Math.random() * 0.4 + 0.6);
    dummy.updateMatrix();
    tree.leaves.setMatrixAt(i, dummy.matrix);
    //tree.leaves.setColorAt(i, new THREE.Color(Math.random() * 0xffffff));
  }
  tree.group.add(tree.pole, tree.leaves);
})
//-----------------------------INIT
document.body.appendChild(renderer.domElement); 
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
dlight01.position.set(4,2,0);
dlight01.lookAt(0,0,0);
camera.position.set(12,8,0);
controls.target = new THREE.Vector3(0,2,0);
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
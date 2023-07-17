import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';
//-----------------------------THREE 
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);
const alight = new THREE.AmbientLight(0x888888, 0.1);
const dlight01 = new THREE.DirectionalLight(0xcccccc, 0.8);
const leafAlpha = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhQTFRF4uLiHh4eDQ0NOTk5aWlppqamAAAA////hfv/8AAAAKBJREFUeNqM00EWwyAIBNARmHD/G7dVa4wKLcvMT8AXwfWjcH5c1IwE/ATUCP+WLEDmcAdlSRcg9L2mGQyegtPr7hjgnN/APAcFAWAHQYMBJPqAWwPRBAOEHVwrkDB3qUDDHO0+xCOwASYzVoBkhByw38mswweU5Aw5sA40mSADkCttQbkyQJ1Wb/tXsPLczUfIOR0A7yLNVP7d7rteAgwA1u8ZKIWNbo4AAAAASUVORK5CYII=');
//-----------------------------POINTS SPHERE
function volSphereGeom(r = 1, iter = 5){
  const vertsNonBuffer = []; 
  let geom; 
  for(let i = 0; i < iter; i++){
    let step = (r/iter) * (i + 1);
    geom = new THREE.SphereGeometry(step, (i * 4) + 1, (i * 2) + 1);
    vertsNonBuffer.push(...geom.attributes.position.array);
  } 
  //vertsNonBuffer.push(new THREE.SphereGeometry(1, 32, 16).attributes.position.array);
  const verts = new Float32Array([...vertsNonBuffer]);
  console.log(verts); 
  return verts;
}
let geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute( volSphereGeom(1, 8), 3 ));
let hui = new THREE.Points(geo, new THREE.PointsMaterial({color: 0x3180fa, 
  size: 1, sizeAttenuation: true, alphaMap: leafAlpha, alphaTest: 0.8, transparent: true }));
//let hui = new THREE.Points(new THREE.SphereGeometry(1,32,16), new THREE.PointsMaterial({color: 0x3180fa}));
//-----------------------------MATERIALS

//-----------------------------GLTF
/* 
loader.loadAsync("assets/bomb.glb")
  .catch(err => console.error(err))
  .then(gltf => {

})
*/
//-----------------------------INIT
document.body.appendChild(renderer.domElement); 
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(4,2,0);
camera.lookAt(0,0,0);
scene.add(dlight01, hui);
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
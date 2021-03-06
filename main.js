
import { gsap } from 'gsap';
import * as THREE from 'three';
import { Scene } from 'three';
// import lilGuiUmd from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// const server = require('http').createServer();
// const port = process.env.PORT || 3000;

// server.listen(port, () => console.log(`Listening on ${port}`));

// GUI 
// const gui = new lilGuiUmd();

const world = {
  plane: {
    width: 40,
    height: 40,
    widthSegments: 36.5,
    heightSegments: 39,
  }

}

// gui.add(world.plane, "width", 1, 50, .5).onChange (generatePlane)
// gui.add(world.plane, "height", 1, 50, .5).onChange (generatePlane)
// gui.add(world.plane, "widthSegments", 1, 100, .5).onChange (generatePlane)
// gui.add(world.plane, "heightSegments", 1, 100, .5).onChange (generatePlane)


// function to simplify code to update plane when control values are moved
function generatePlane () {
  planeMesh.geometry.dispose ()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)

  // Vertice position randomization
const { array } = planeMesh.geometry.attributes.position
const randomValues = []
for (let i = 0; i < array.length; i ++) {

    if (i % 3 === 0) {
    const x = array[i]
    const y = array[i + 1] 
    const z = array[i + 2]

    array[i] = x + (Math.random() - 0.5)
    array[i + 1] = y + (Math.random() - 0.5)
    array[i + 2] = z + Math.random()
    }
    randomValues.push(Math.random() - 0.5)
}

planeMesh.geometry.attributes.position.randomValues = randomValues
planeMesh.geometry.attributes.position.orignalPosition = planeMesh.geometry.attributes.position.array

const colors = []
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  colors.push(0, 0.19, 0.4)
}

planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

}


// Raycaster (an object that tells us where our 'laserpointer' is relative to our scene. monitor touches)

const raycaster = new THREE.Raycaster()

// Camera

// Scene

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, innerWidth/ innerHeight, 0.1, 1000); 
camera.position.z = 5
scene.add( camera );

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera)


// Orbit Controls

new OrbitControls (camera, renderer.domElement)

// Plane
const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.width);
const planeMaterial = new THREE.MeshPhongMaterial ({side: THREE.DoubleSide, flatShading: THREE.FlatShading, vertexColors: true}); //to change vertice on animation, vertexColors must = true
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
generatePlane()

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);


// Mesh
// const mesh = new THREE.Mesh(boxGeometry, material);


// Animation

const mouse = {
  x: undefined,
  y: undefined
}

let frame = 0

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate () {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    raycaster.setFromCamera(mouse, camera)     // checking for tracking of our mouse over our object
    frame += 0.01

    const { array, orignalPosition, randomValues } = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    //x coordinate
    array[i] = orignalPosition[i] + Math.cos(frame + randomValues[i]) * 0.002

    //y coordinate
    array[i + 1] = orignalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.002
  }
    planeMesh.geometry.attributes.position.needsUpdate = true

    const intersects = raycaster.intersectObject(planeMesh)
      // based off intersected face, change surrounding vertex colors
    if (intersects.length > 0) {
      const { color } = intersects[0].object.geometry.attributes //object destructuring
      // Vertice 1
      color.setX(intersects[0].face.a, 0.1)
      color.setY(intersects[0].face.a, 0.5)
      color.setZ(intersects[0].face.a, 1)
      // Vertice 2
      color.setX(intersects[0].face.b, 0.1)
      color.setY(intersects[0].face.b, 0.5)
      color.setZ(intersects[0].face.b, 1)
      // Vertice 3
      color.setX(intersects[0].face.c, 0.1)
      color.setY(intersects[0].face.c, 0.5)
      color.setZ(intersects[0].face.c, 1)
      color.needsUpdate = true  //updating color

      const intialColor = {
        r: 0, 
        g: 0.19, 
        b: 0.4}

        const hoverColor = {
          r: 0.1,
          g: 0.5,
          b: 1
        }
      gsap.to(hoverColor, {
        r: intialColor.r,
        g: intialColor.g,
        b: intialColor.b,
        duration: 1,
        onUpdate: () => {
          // Vertice 1
          color.setX(intersects[0].face.a, hoverColor.r)
          color.setY(intersects[0].face.a, hoverColor.g)
          color.setZ(intersects[0].face.a, hoverColor.b)
          // Vertice 2
          color.setX(intersects[0].face.b, hoverColor.r)
          color.setY(intersects[0].face.b, hoverColor.g)
          color.setZ(intersects[0].face.b, hoverColor.b)
          // Vertice 3
          color.setX(intersects[0].face.c, hoverColor.r)
          color.setY(intersects[0].face.c, hoverColor.g)
          color.setZ(intersects[0].face.c, hoverColor.b)
          color.needsUpdate = true
          }
      })
    }
}

animate()


// events

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1 
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1 //set event to - because y is flipped compared to x
})

// const scene2 = new THREE.Scene();

// const geometry = new THREE.TorusGeometry(.7, .2, 16, 100);

// const material = new THREE.MeshBasicMaterial();
// material.color = new THREE.Color(0xff00000);

// const sphere = new THREE.Mesh(geometry,material);
// scene2.add(sphere);

// const camera2 = new THREE.PerspectiveCamera(75, innerWidth/ innerHeight, 0.1, 1000); 
// camera.position.z = 5
// scene2.add( camera2 );

// // Renderer
// const renderer2 = new THREE.WebGLRenderer();
// renderer2.setSize(window.innerWidth, window.innerHeight);
// renderer2.setPixelRatio(window.devicePixelRatio);
// document.body.appendChild(renderer2.domElement);
// renderer2.render(scene2, camera2)

// const light2 = new THREE.DirectionalLight(0xffffff, 1);
// light2.position.set(0, 1, 1);
// scene2.add(light2);

// const backLight2 = new THREE.DirectionalLight(0xffffff, 1);
// backLight2.position.set(0, 0, -1);
// scene2.add(backLight2);

// function animate2 () {
//   requestAnimationFrame(animate2)
//   renderer2.render(scene2, camera2)
// }
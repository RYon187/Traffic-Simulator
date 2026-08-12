import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { inputs } from './input.js';

import World from './world.js';
import Car from './car.js';


export default class Player {

    private camera: THREE.OrthographicCamera;
    private controls: OrbitControls<THREE.OrthographicCamera>;
    private speed: number;

    constructor(camera: THREE.OrthographicCamera, controls: OrbitControls<THREE.OrthographicCamera>) {
        this.speed = 0.05;
        this.camera = camera;
        this.controls = controls;

        inputs.onLeftClick((event) => {
            this.TempFunction(event.x, event.y);
        });
    }

    public update(): void {
        this.updateMovement();
    }

    private updateMovement(): void {
        const moveDirection = new THREE.Vector3();

        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        if (forward.lengthSq() > 0) forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

        if (inputs.moveUp)    moveDirection.add(forward);
        if (inputs.moveDown)  moveDirection.sub(forward);
        if (inputs.moveRight) moveDirection.sub(right);
        if (inputs.moveLeft)  moveDirection.add(right);

        if (moveDirection.lengthSq() > 0) {
            moveDirection.normalize().multiplyScalar(this.speed);
            moveDirection.y = 0;
            this.controls.target.add(moveDirection);
            this.camera.position.add(moveDirection);
        }
    }

    private TempFunction(x: number, y: number) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Normal, constant
        const targetWorldPos = new THREE.Vector3();

        // Update mouse NDC (-1 to +1)
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);
        raycaster.ray.intersectPlane(plane, targetWorldPos);


        const car = new Car(0, targetWorldPos);
        car.addToScene(World.scene);
    }
}
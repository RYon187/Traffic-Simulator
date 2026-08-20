import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { inputs } from './input.js';

import World from './world.js';
import Car from './car.js';

enum PlayerMode {
    PLAYING,
    EDITING_IDLE, // in 'edit' mode but not actively editing / building anything
    CREATING_ROAD
}

export default class Player {

    private camera: THREE.OrthographicCamera;
    private controls: OrbitControls<THREE.OrthographicCamera>;
    private speed: number;

    // player mode

    public static mode: PlayerMode = PlayerMode.PLAYING;

    // road-editing parameters (WILL REFACTOR)

    private startTile: THREE.Vector3 | undefined = undefined;
    private endTile: THREE.Vector3 | undefined = undefined;
    // private visitedTiles: THREE.Vector3[] = [];
    private pathLines: THREE.Line[] = [];

    constructor(camera: THREE.OrthographicCamera, controls: OrbitControls<THREE.OrthographicCamera>) {
        this.speed = 0.05;
        this.camera = camera;
        this.controls = controls;

        inputs.onLeftClickDown((event) => {
            if (Player.mode == PlayerMode.EDITING_IDLE) {
                this.startNewRoad();
            }
        });

        inputs.onLeftClickUp((event) => {
            if (Player.mode == PlayerMode.CREATING_ROAD) {
                this.applyNewRoad();
            }
        });

        inputs.onKeyDown("KeyE", (event) => {
            Player.mode = PlayerMode.EDITING_IDLE;
        });

        inputs.onKeyDown("KeyP", (event) => {
            Player.mode = PlayerMode.PLAYING;
        });
    }

    public update(): void {
        this.updateMovement();

        if (Player.mode == PlayerMode.CREATING_ROAD) {
            this.UpdateEditPath();
        }
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

    private UpdateEditPath(): void {

        const mouse = inputs.getMousePosition();
        const newTile: THREE.Vector3 = World.screenToGridPos(mouse.x, mouse.y);

        // if the user is hovering over the same tile, don't bother with updating anything
        if (this.endTile != undefined && this.endTile.equals(newTile)) {
            return;
        }

        if (this.endTile != undefined && this.startTile?.equals(this.endTile)) {
            // invalid ?
        }

        this.endTile = newTile;
    }

    private startNewRoad(): void {
        const mouse = inputs.getMousePosition();
        const tile: THREE.Vector3 = World.screenToGridPos(mouse.x, mouse.y);
        this.startTile = tile;

        Player.mode = PlayerMode.CREATING_ROAD;
        World.disableRotation();
    }

    private applyNewRoad(): void {

        if (!(this.startTile && this.endTile)) {
            return;
        }

        // if the start and end are equal then return
        if (this.startTile?.equals(this.endTile)) {
            return;
        }

        // reset path parameters
        this.startTile = undefined;
        this.endTile = undefined;

        Player.mode = PlayerMode.EDITING_IDLE;
        World.enableRotation();
    }
}
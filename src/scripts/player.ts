import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { inputs } from './input.js';

import World from './world.js';
import Car from './car.js';

enum PlayerMode {
    PLAYING,
    EDITING_IDLE, // in 'edit' mode but not actively editing / building anything
    CREATING_ROADS
}

export default class Player {

    private camera: THREE.OrthographicCamera;
    private controls: OrbitControls<THREE.OrthographicCamera>;
    private speed: number;

    // player mode

    public static mode: PlayerMode = PlayerMode.PLAYING;

    // road-editing parameters (WILL REFACTOR)

    private currentTile: THREE.Vector3 | undefined = undefined;
    private visitedTiles: THREE.Vector3[] = [];
    private pathLines: THREE.Line[] = [];

    constructor(camera: THREE.OrthographicCamera, controls: OrbitControls<THREE.OrthographicCamera>) {
        this.speed = 0.05;
        this.camera = camera;
        this.controls = controls;

        inputs.onLeftClickDown((event) => {
            if (Player.mode == PlayerMode.EDITING_IDLE) {
                Player.mode = PlayerMode.CREATING_ROADS;
                World.disableRotation();
            }
        });

        inputs.onLeftClickUp((event) => {
            if (Player.mode == PlayerMode.CREATING_ROADS) {
                Player.mode = PlayerMode.EDITING_IDLE;
                World.enableRotation();
                this.applyEditPath();
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

        if (Player.mode == PlayerMode.CREATING_ROADS) {
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
 
        // if the user is hovering over the same tile, don't bother with updating the path
        if (this.currentTile != undefined && this.currentTile.equals(newTile)) {
            return;
        }

        // if the previous tile is undefined, that means the list is empty, so we start here
        if (this.currentTile == undefined) {
            this.visitedTiles.push(newTile);
            this.currentTile = newTile;
            return;
        }

        const prevTile: THREE.Vector3 | undefined = this.visitedTiles.at(-2);

        // if the new tile is the same as the previous one, then delete the current one (go back one) and return
        if (prevTile != undefined && prevTile.equals(newTile)) {
            this.visitedTiles.pop();
            this.currentTile = prevTile;
            return;
        }

        // if the new tile already exists in the path, don't add it
        if (this.visitedTiles.find(_tile => _tile.equals(newTile))) {
            return;
        }

        // if the new tile is not 4-way adjacent to the current one, don't add it (1.1 is just to avoid floating point issues, if any)
        if (Math.abs(this.currentTile.x - newTile.x) + Math.abs(this.currentTile.z - newTile.z) > 1.1) {
            return;
        }

        // finally, add the new tile to the list and set it as the new current
        this.visitedTiles.push(newTile);
        this.currentTile = newTile;
    }

    private applyEditPath(): void {

        // prerequisit of 2+ visited tiles in a path
        if (this.visitedTiles.length <= 1) {
            return;
        }

        for (let i: number = 1; i < this.visitedTiles.length; i++) {

            const prevTile = this.visitedTiles[i - 1];
            const currTile = this.visitedTiles[i];

            const geometry = new THREE.BufferGeometry().setFromPoints([prevTile, currTile]);
            const line = new THREE.Line(geometry, World.lineMaterial);
            line.position.y += 0.05;
            World.scene.add(line);
            this.pathLines.push(line);

        }

        World.lineMaterial

        // reset path parameters
        this.currentTile = undefined;
        this.visitedTiles = [];
    }
}
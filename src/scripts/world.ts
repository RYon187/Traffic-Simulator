import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { inputs } from './input.js';
import Car from './car.js';
import Player from './player.js';

export default class World {

    private static readonly _scene: THREE.Scene = new THREE.Scene();
    private static _renderer: THREE.WebGLRenderer;
    private static _camera: THREE.OrthographicCamera;
    private static controls: OrbitControls<THREE.OrthographicCamera>;

    private static player: Player;
    private static cars: Car[];

    // world objects

    private static readonly plane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // world parameters

    private static readonly GRID_WIDTH: number  = 25;
    private static readonly GRID_HEIGHT: number = 25;

    // states

    public static lineMaterial: THREE.LineBasicMaterial;
    private static lines: THREE.Line[];
    private static showingGrid: boolean = false;

    constructor() {

        World.initializeRenderer();
        World.initializeCamera();
        World.initializeControls();
        World.initializeLighting();
        World.initializeGrid();

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(World.GRID_WIDTH, World.GRID_HEIGHT),
            new THREE.MeshStandardMaterial({ color: 0xb3d9e3, roughness: 0.9, metalness: 0.0 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        plane.receiveShadow = true;
        World.scene.add(plane);

        World.cars = [];
        
        const radius = 10;
        const density = 25;
        
        for (let i: number = 0; i < 25; i++) {
            const car = new Car(2 * Math.PI * i / density, new THREE.Vector3(radius * Math.sin(2 * Math.PI * i / density), 0, radius * Math.cos(2 * Math.PI * i / density)));
            car.addToScene(World.scene);
            World.cars.push(car);
        }
        
        World.player = new Player(World.camera, World.controls);

        inputs.onKeyDown("Backquote", (event) => {
            World.showingGrid = !World.showingGrid;
            World.toggleGrid(World.showingGrid);
        });

    }

    private static initializeRenderer(): void {
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFShadowMap;
        document.body.appendChild(this._renderer.domElement);
    }

    private static initializeCamera(): void {
        const viewHalfHeight = 1;
        const near = 0.1;
        const far = 1000;
        this._camera = new THREE.OrthographicCamera(-viewHalfHeight, viewHalfHeight, viewHalfHeight, -viewHalfHeight, near, far);

        function resizeCamera() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const aspect = width / height;

            const halfHeight = viewHalfHeight;
            World.camera.left = -halfHeight * aspect;
            World.camera.right = halfHeight * aspect;
            World.camera.top = halfHeight;
            World.camera.bottom = -halfHeight;
            World.camera.updateProjectionMatrix();

            World.renderer.setSize(width, height);
            World.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        window.addEventListener('resize', resizeCamera);
        resizeCamera();

        this.camera.position.set(0, 200, 14);
    }

    private static initializeControls(): void {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.zoomSpeed = 0.8;
        this.controls.minZoom = 0.1;
        this.controls.maxZoom = 2.0;
        this.controls.minPolarAngle = Math.PI / 2.4;
        this.controls.maxPolarAngle = Math.PI / 2.4;

        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    private static initializeLighting(): void {
        const light = new THREE.DirectionalLight(0xffffff, 2.0);
        light.position.set(0, 200, 100);
        light.target.position.set(0, 0, 0);
        this.scene.add(light);
        this.scene.add(light.target);
        
        light.castShadow = true;
        light.shadow.mapSize.width  = 2048;
        light.shadow.mapSize.height = 2048;
        
        const mult = 30;
        
        light.shadow.camera.left   = -1 * mult;
        light.shadow.camera.right  = 1 * mult;  
        light.shadow.camera.top    = 1 * mult;
        light.shadow.camera.bottom = -1 * mult;
        // light.shadow.camera.near = 0.1;
        // light.shadow.camera.far = 200;
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
    }

    private static initializeGrid(): void {

        this.lines = [];

        this.lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

        const halfWidth  = this.GRID_WIDTH / 2;
        const halfHeight = this.GRID_HEIGHT / 2;

        for (let x: number = -halfWidth; x < halfWidth; x++) {
            const points = [];
            points.push(new THREE.Vector3(x, 0.05, -halfHeight));
            points.push(new THREE.Vector3(x, 0.05, halfHeight));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, this.lineMaterial);
            this.lines.push(line);
        }

        for (let y: number = -halfHeight; y < halfHeight; y++) {
            const points = [];
            points.push(new THREE.Vector3(-halfWidth, 0.05, y));
            points.push(new THREE.Vector3(halfWidth, 0.05, y));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, this.lineMaterial);
            this.scene.add(line);
            this.lines.push(line);
        }

        this.lines.forEach(line => {
            line.visible = false;
            this.scene.add(line);
        });
    }

    // UPDATE LOOP
    static update(): void {
        this.player.update();
        this.cars.forEach(car => car.update());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private static toggleGrid(state: boolean): void {
        this.lines.forEach(line => {
            line.visible = state;
        });
    }

    // UTILS

    static screenToGridPos(x: number, y:number): THREE.Vector3 {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const targetWorldPos = new THREE.Vector3();

        // shift mouse to range -1 to 1
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);
        raycaster.ray.intersectPlane(World.plane, targetWorldPos);

        targetWorldPos.x = Math.floor(targetWorldPos.x + 0.5); 
        targetWorldPos.z = Math.floor(targetWorldPos.z + 0.5); 

        return targetWorldPos; //new THREE.Vector2(targetWorldPos.x, targetWorldPos.z);
    }

    // SETTERS

    public static enableRotation(): void {
        this.controls.enableRotate = true;
    }

    public static disableRotation(): void {
        this.controls.enableRotate = false;
    }

    // GETTERS

    static get scene(): THREE.Scene {
        return this._scene;
    }

    static get camera(): THREE.OrthographicCamera {
        return this._camera;
    }

    static get renderer(): THREE.WebGLRenderer {
        return this._renderer;
    }
}
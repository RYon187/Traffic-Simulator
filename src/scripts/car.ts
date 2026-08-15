import * as THREE from 'three';

export default class Car {

    private static geometry = new THREE.BoxGeometry();
    private static material = new THREE.MeshStandardMaterial({ color: 0x475357, roughness: 0.7, metalness: 0.2 });

    private mesh;
    private t: number;

    private pos: THREE.Vector3;

    constructor(t: number, pos: THREE.Vector3 = new THREE.Vector3) {
        this.mesh = new THREE.Mesh(Car.geometry, Car.material);
        this.mesh.position.y += 0;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.t = t;

        this.pos = pos;
    }

    public addToScene(scene: THREE.Scene) {
        scene.add(this.mesh);
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    }

    public getMesh() {
        return this.mesh;
    }

    public update() {
        this.t += 0.01;
        this.mesh.position.y = 1.5 + Math.sin(this.t);
        this.mesh.rotation.y += 0.01;
    }

}
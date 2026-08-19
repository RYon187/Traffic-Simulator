import { IRoad } from './road_interfaces.ts';

import * as THREE from 'three';
import Car from '../car.ts';

export default class OneWay implements IRoad {

    private lanes: number;
    private cars: Car[][];
    private next: IRoad | undefined; 

    private _mesh: THREE.Group;

    constructor();

    constructor(next?: IRoad, lanes?: number) {
        if (next)
            this.next = next;

        if (lanes)
            this.lanes = lanes;
        else 
            this.lanes = 1;

        this.cars = [[]];

        this._mesh = new THREE.Group();
        this.initializeMesh();
    }

    private initializeMesh(): void {
        const height = 0.2;
        const width  = 0.5 * this.lanes;

        const geometry = new THREE.BoxGeometry(1, height, width);
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const roadMesh = new THREE.Mesh( geometry, material );

        this._mesh.add(roadMesh);
    }

    public getPosition(progress: number, lane: number): THREE.Vector3 {

        const offset: THREE.Vector3 = this.mesh.position;

        return new THREE.Vector3();
    }

    public enter(car: Car): void {

    }

    public exit(car: Car): void {

    }

    public get mesh(): THREE.Group {
        return this._mesh;
    }

}
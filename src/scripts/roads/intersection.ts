import { IIntersection } from './road_interfaces.ts';

import Car from '../car.ts';
import * as THREE from 'three';

export class Intersection implements IIntersection {

    public getPosition(progress: number, lane: number): THREE.Vector3 {
        return new THREE.Vector3();
    }

    public enter(car: Car): void {

    }

    public exit(car: Car): void {

    }

}
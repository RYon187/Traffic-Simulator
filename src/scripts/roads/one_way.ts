import { IRoad } from './road_interfaces.ts';

import Car from '../car.ts';

export class OneWay implements IRoad {

    private lanes: number;
    private cars: Car[][];
    private next: IRoad; 

    constructor(next: IRoad, lanes: number) {
        this.next = next;
        this.lanes = lanes;

        this.cars = [[]];
    }

    public enter(car: Car): void {

    }

    public exit(car: Car): void {

    }

}
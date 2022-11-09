import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Injectable} from "@angular/core";

@Injectable()
export class ActivatedRouteStub {

    //route params
    private _testParams = {};
    private paramsSubject = new BehaviorSubject(this.testParams);
    params = this.paramsSubject.asObservable();

    get testParams() { return this._testParams; }
    set testParams(params: {}) {
        this._testParams = params;
        this.paramsSubject.next(params);
    }

    //route data
    private _testData = {};
    private dataSubject = new BehaviorSubject(this.testData);
    data = this.dataSubject.asObservable();

    get testData() { return this._testData; }
    set testData(data: {}) {
        this._testData = data;
        this.dataSubject.next(data);
    }

    get snapshot() {
        return { params: this.testParams, queryParams: this.testParams, data: this.testData };
    }
}
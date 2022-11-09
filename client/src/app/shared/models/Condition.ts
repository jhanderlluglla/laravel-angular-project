import {Operator} from "./Operator";

export class Condition {
	id: number;
	name: string;
	type: string;
	operators?: Operator[];

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
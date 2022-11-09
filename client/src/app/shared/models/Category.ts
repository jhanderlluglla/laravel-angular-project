import {Article} from "./Article";

export class Category {
	id: number;
	name: string;
	description?: string;
	position: number;
	default: boolean;
	parent_id?: number;
	hidden: boolean;
	created_at?: string;
	updated_at?: string;
	children?: Category[];
	parent?: Category;
	articles?: Article[];

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
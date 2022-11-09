import {User} from "./User";
import {Category} from "./Category";

export class Group {
	id: number;
	name: string;
	permissions?: string;
	default: number;
	guests: number;
	created_at?: string;
	updated_at?: string;
	users?: User[];
	categories?: Category[];
	color?: string;

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
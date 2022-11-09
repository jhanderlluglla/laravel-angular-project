import {User} from "./User";
import {Tag} from "./Tag";
import {Reply} from "./Reply";
import {Priority} from "./Priority";

export class Ticket {
	id: number;
	subject: string;
	user_id: number;
	priority_id?: number;
	closed_at?: string;
	closed_by?: number;
	assigned_to?: number;
	created_at?: string;
	updated_at?: string;
	updated_at_formatted: string;
	user?: User;
	tags?: Tag[];
	categories?: Tag[];
	replies?: Reply[];
	repliesCount?: Reply;
	latest_replies?: Reply[];
	latest_reply?: Reply;
	notes?: Reply[];
	priority?: Priority

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
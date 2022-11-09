import {Upload} from "./Upload";
import {Ticket} from "./Ticket";
import {User} from "./User";

export class Reply {
	id: number;
	body: string;
	user_id: number;
	ticket_id: number;
	uuid?: string;
	type: string = 'replies';
	created_at?: string;
	updated_at?: string;
	uploads?: Upload[];
	ticket?: Ticket;
	user?: User;

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
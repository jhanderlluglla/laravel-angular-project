import {Upload} from "./Upload";
import {User} from "./User";

export class CannedReply {
	id: number;
	name: string;
	body: string;
	user_id: number;
	created_at?: string;
	updated_at?: string;
	uploads?: Upload[];
	user?: User;

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
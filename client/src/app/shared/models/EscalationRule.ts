import {Stage} from "./Stage";
import {Tag} from "./Tag";
import {Supervisor} from "./Supervisor";
import {Priority} from "./Priority";

export class EscalationRule {
	id: number;
	name: string;
	stage: Stage;
	minutes: number;
	supervisors: Supervisor[];
	supervisor_ids: number[];
	priority: Priority;
	priority_id: number;
	tag: Tag;
	tag_id: number;
	stage_id: number;
	status?: false;
	created_at?: string;
	updated_at?: string;
	is_started: number;

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
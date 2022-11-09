export class Action {
	id: number;
	display_name: string;
	name: string;
	aborts_cycle: boolean;
	updates_ticket: boolean = true;
	input_config?: string;

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
export class Tag {
	id: number;
	name: string;
	display_name?: string;
	type: string = 'custom';
	created_at?: string;
	updated_at?: string;

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
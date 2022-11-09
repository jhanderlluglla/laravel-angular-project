import {Category} from "./Category";
import {Tag} from "./Tag";
import {ArticleFeedback} from "./ArticleFeedback";

export class Article {
	id: number;
	title: string;
	body: string;
	slug?: string;
	extra_data?: string;
	draft: boolean;
	visibility: string = 'public';
	views: number;
	position: number;
	description?: string;
	created_at?: string;
	updated_at?: string;
	categories?: Category[];
	tags?: Tag[];
	feedback?: ArticleFeedback[];

	constructor(params: Object = {}) {
        for (let name in params) {
            this[name] = params[name];
        }
    }
}
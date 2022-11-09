import {modelFactory} from "../../../../testing/model-factory";
import {CategoriesFilterer} from "./categories-filterer";
import {Category} from "../../shared/models/Category";

describe('CategoriesFiltererService', () => {
    let filterer = new CategoriesFilterer();
    let categories: Category[];

    beforeEach(() => {
        categories = [modelFactory.make('Category'), modelFactory.make('Category', 1, {children: modelFactory.make('Category', 2)})];
    });

    it('resets categories to default if no query specified', () => {
        expect(filterer.filter('', categories)).toEqual(categories);
    });

    it('filters categories by name', () => {
        expect(filterer.filter(categories[0].name, categories)).toEqual([categories[0]]);
    });

    it('filters categories by children names', () => {
        let response = filterer.filter(categories[1].children[0].name, categories);

        //returns only parent category with child that matched the query
        expect(response.length).toEqual(1);
        expect(response[0].name).toEqual(categories[1].name);
        expect(response[0].children.length).toEqual(1);
        expect(response[0].children[0].name).toEqual(categories[1].children[0].name);
    });
});
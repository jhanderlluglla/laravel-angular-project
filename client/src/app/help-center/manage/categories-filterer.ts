import {Category} from "../../shared/models/Category";
import {utils} from "../../shared/utils";

export class CategoriesFilterer {

    /**
     * Filter categories by specified search query.
     */
    public filter(query: string = null, categories: Category[]): Category[] {
        if ( ! query) return categories.slice();

        let filtered = [];

        for (let i = 0; i < categories.length; i++) {
            let category = Object.assign({}, categories[i]);

            //if category name contains query, push it with all children
            if (utils.strContains(categories[i].name, query)) {
                filtered.push(category);

            //if one of categories children names contain query,
            //push category only with that child
            } else {
                category.children = category.children.filter(child => {
                    return utils.strContains(child['name'], query);
                });

                if (category.children.length) {
                    filtered.push(category);
                }
            }
        }

        return filtered;
    }
}
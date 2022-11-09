import {Component, ViewEncapsulation, OnInit, EventEmitter, ViewChild, Output} from "@angular/core";
import {CategoriesManagerComponent} from "../../categories-manager/categories-manager.component";
import {TagsManagerComponent} from "../../tags-manager/tags-manager.component";

@Component({
    selector: 'articles-list-filters',
    templateUrl: './articles-list-filters.component.html',
    styleUrls: ['./articles-list-filters.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ArticlesListFiltersComponent implements OnInit {
    @ViewChild(TagsManagerComponent) tagsManager: TagsManagerComponent;
    @ViewChild(CategoriesManagerComponent) categoriesManager: CategoriesManagerComponent;

    /**
     * Fired when any of the filters onChange.
     */
    @Output() public onChange = new EventEmitter();

    /**
     * Available filters for articles list.
     */
    private filters: {categories?: number[], tags?: string, draft?: number} = {draft: null};

    ngOnInit() {
        this.categoriesManager.refresh().then(() => this.onChange.emit());
    }

    /**
     * Get current articles list filters.
     */
    public getFilters() {
        return Object.assign(this.filters, {categories: this.categoriesManager.getExactSelectedCategories()});
    }

    /**
     * Apply specified filter to articles list.
     */
    public applyFilter(name: string, value: any) {
        this.filters[name] = value;
        this.onChange.emit();
    }

    /**
     * Check whether specified filter is currently applied to articles list.
     */
    public filterIsActive(name: string, value?: string|number): boolean {
        if (value !== undefined) {
            return this.filters[name] === value;
        } else {
            return this.filters[name] || this.filters[name] === 0;
        }
    }
}

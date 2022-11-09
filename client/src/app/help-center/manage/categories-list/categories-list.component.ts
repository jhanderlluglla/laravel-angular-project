import {Component, OnInit, ViewEncapsulation, ViewChild} from '@angular/core';
import {ModalService} from "../../../shared/modal/modal.service";
import {FormControl} from "@angular/forms";
import {CategoryModalComponent} from "../category-modal/category-modal.component";
import {Category} from "../../../shared/models/Category";
import {CategoriesService} from "../../shared/categories.service";
import {CategoriesFilterer} from "../categories-filterer";
import {ReorderDirective} from "../../../shared/reorder.directive";

@Component({
    selector: 'categories-list',
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CategoriesListComponent implements OnInit {
    @ViewChild(ReorderDirective) private sorter: ReorderDirective;

    /**
     * Control for categories search field.
     */
   public searchQuery = new FormControl();

    /**
     * All available categories.
     */
    public allCategories: Category[] = [];

    /**
     * Categories filtered via search bar.
     */
    public filteredCategories: Category[] = [];

    constructor(public api: CategoriesService, private modal: ModalService) { }

    ngOnInit() {
        this.updateCategories();
        this.bindSearchQuery();
    }

    /**
     * Open create/update category modal.
     */
    public showNewCategoryModal() {
        this.modal.show(CategoryModalComponent).onDone.subscribe(() => this.updateCategories());
    }

    /**
     * Get all available categories from backend.
     */
    public updateCategories() {
        this.api.getCategories().subscribe(response => {
            this.filteredCategories = response;
            this.allCategories      = response;
            this.filterCategories(this.searchQuery.value);
        });
    }

    /**
     * Re-order help center categories.
     */
    public reorderCategories(ids: number[]) {
        this.api.reorderCategories(ids).subscribe();
    }

    /**
     * Bind categories search bar events needed
     * for filtering on keyup.
     */
    private bindSearchQuery() {
        this.searchQuery
            .valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(query => this.filterCategories(query));
    }

    /**
     * Filter categories list by specified search query.
     */
    private filterCategories(searchQuery: string) {
        setTimeout(() => this.sorter.refresh());
        this.filteredCategories = (new CategoriesFilterer).filter(searchQuery, this.allCategories);
    }
}

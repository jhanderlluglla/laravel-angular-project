import {Component, ViewEncapsulation, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {Category} from "../../../shared/models/Category";
import {CategoriesService} from "../../shared/categories.service";
import {FormControl} from "@angular/forms";
import {CategoriesFilterer} from "../categories-filterer";
import {LocalStorage} from "../../../shared/local-storage.service";
import {CustomScrollbarDirective} from "../../../shared/custom-scrollbar/custom-scrollbar.directive";

@Component({
    selector: 'categories-manager',
    templateUrl: './categories-manager.component.html',
    styleUrls: ['./categories-manager.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CategoriesManagerComponent implements OnInit {
    @ViewChild(CustomScrollbarDirective) scrollbar: CustomScrollbarDirective;

    /**
     * Fired only when changes have originated from component and not setters.
     */
    @Output() public onChange = new EventEmitter();

    /**
     * Control for categories search field.
     */
    public searchQuery = new FormControl();

    /**
     * Currently selected categories.
     */
    public selectedCategories: number[] = [];

    /**
     * Categories filtered by search query.
     */
    public categories: Category[] = [];

    /**
     * All available categories.
     */
    public allCategories: Category[] = [];

    /**
     * CategoriesManagerComponent Constructor.
     */
    constructor(private api: CategoriesService, private storage: LocalStorage) {}

    ngOnInit() {
        this.bindSearchQuery();
        this.selectedCategories = this.storage.get('selectedCategories', []);

        if ( ! this.allCategories.length) {
            this.refresh();
        }
    }

    /**
     * Return currently selected categories.
     */
    public getSelectedCategories() {
        return this.selectedCategories;
    }

    /**
     * Select specified categories.
     */
    public setSelectedCategories(categories: Category[]) {
        if ( ! categories) return;
        this.selectedCategories = categories.map(category => category.id);
    }

    /**
     * Set specified categories on component.
     */
    public setCategories(categories: Category[]) {
        this.categories = categories;
        this.allCategories = categories;
    }

    /**
     * Refresh all categories from backend.
     */
    public refresh(): Promise<any> {
        return new Promise(resolve => {
            this.api.getCategories().subscribe(categories => {
                this.setCategories(categories);
                resolve();
            }
        )});
    }

    /**
     * Check if specified category is selected.
     */
    public categoryIsSelected(id: number) {
        return this.selectedCategories.indexOf(id) > -1;
    }

    /**
     * Check if any of specified category children are selected.
     */
    public childIsSelected(category: Category): boolean {
        if ( ! category.children.length) return false;

        for (let i = 0; i < category.children.length; i++) {
            if (this.categoryIsSelected(category.children[i].id)) {
                return true;
            }
        }
    }

    /**
     * Select or deselect specified category and its parent (if specified)
     */
    public toggle(category: Category, parentId?: number) {
        let index = this.selectedCategories.indexOf(category.id);

        //toggle category
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(category.id);
        }

        //also select parent if we are toggling child category
        if (parentId && ! this.categoryIsSelected(parentId)) {
            this.selectedCategories.push(parentId);
        }

        //deselect all child categories as well
        this.deselectChildren(category);

        this.storage.set('selectedCategories', this.selectedCategories);
        this.onChange.emit();
    }

    /**
     * Deselect all categories.
     */
    public deselectAll() {
        this.selectedCategories = [];
        this.storage.set('selectedCategories', []);
        this.onChange.emit();
    }

    /**
     * Deselect all children of specified category.
     */
    private deselectChildren(parent: Category) {
        if ( ! parent.children) return;

        parent.children.forEach(child => {
            let index = this.selectedCategories.indexOf(child.id);
            index > -1 && this.selectedCategories.splice(index, 1);
        });
    }

    /**
     * Get child categories and parent categories
     * whose children are not selected.
     */
    public getExactSelectedCategories() {
        return this.selectedCategories.filter(id => {
            let category = this.categories.find(category => category.id == id);
            return ! category || ! this.childIsSelected(category);
        });
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
            .subscribe(query => {
                this.categories = (new CategoriesFilterer).filter(query, this.allCategories);
                this.scrollbar.update();
            });
    }
}

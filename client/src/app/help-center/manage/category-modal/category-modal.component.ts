import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {Category} from "../../../shared/models/Category";
import {BaseModalClass} from "../../../shared/modal/base-modal";
import {CategoriesService} from "../../shared/categories.service";

@Component({
    selector: 'category-modal',
    templateUrl: './category-modal.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class CategoryModalComponent extends BaseModalClass {

    /**
     * All available categories.
     */
    public categories: Category[] = [];

    /**
     * Category Model.
     */
    public model: Category = new Category({parent_id: null});

    /**
     * If we are updating existing category or creating a new one.
     */
    public updating: boolean = false;

    /**
     * CategoryModalComponent Constructor.
     */
    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        protected api: CategoriesService,
    ) {
        super(elementRef, renderer);
    }

    /**
     * Open the modal.
     */
    public show(params: {category?: Category, parentId?: number}) {
        this.fetchCategories(params.category);

        //hydrate category model, if it's specified
        if (params.category) {
            this.updating = true;
            this.model = params.category;
        }

        //set parent_id on model, if it's specified
        if (params.parentId) this.model.parent_id = params.parentId;

        super.show(params);
    }

    /**
     * Create or update category and close modal.
     */
    public confirm() {
        this.api.createOrUpdateCategory(this.getPayload()).subscribe(category => {
            super.done(category);
        }, super.handleErrors.bind(this));
    }

    /**
     * Get payload for backend request.
     */
    private getPayload() {
        return {
            id: this.model.id,
            name: this.model.name,
            description: this.model.description,
            parent_id: this.model.parent_id || null,
        }
    }

    /**
     * Get all available categories from backend.
     */
    private fetchCategories(category?: Category) {
        this.api.getCategories().subscribe(categories => {
            //remove category we've currently editing from parent_id
            //select so category can't be select as parent to itself
            this.categories = categories.filter(current => {
                return ! category || category.id != current.id;
            })
        });
    }
}
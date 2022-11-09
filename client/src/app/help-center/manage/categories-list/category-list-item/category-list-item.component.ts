import {Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {ModalService} from "../../../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../../../shared/modal/confirm-modal/confirm-modal.component";
import {CategoryModalComponent} from "../../category-modal/category-modal.component";
import {Category} from "../../../../shared/models/Category";
import {CategoriesService} from "../../../shared/categories.service";
import {Router} from "@angular/router";
import {LocalStorage} from "../../../../shared/local-storage.service";

@Component({
    selector: 'category-list-item',
    templateUrl: './category-list-item.component.html',
    styleUrls: ['./category-list-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListItemComponent {

    /**
     * CategoryListItemComponent Constructor.
     */
    constructor(
        private modal: ModalService,
        private api: CategoriesService,
        private router: Router,
        private storage: LocalStorage,
    ) {}

    /**
     * Help center category model instance.
     */
    @Input() public category: Category;

    /**
     * Fired when this category model changes or is deleted.
     */
    @Output() public onChange = new EventEmitter();

    /**
     * Show modal for creating child category.
     */
    public openCreateChildCategoryModal() {
        this.modal.show(CategoryModalComponent, {parentId: this.category.id})
            .onDone.subscribe(() => this.onChange.emit());
    }

    /**
     * Show modal for updating specified category.
     */
    public openUpdateCategoryModal(category: Category) {
        this.modal.show(CategoryModalComponent, {category})
            .onDone.subscribe(() => this.onChange.emit());
    }

    /**
     * Delete specified category if user confirms.
     */
    public maybeDeleteCategory(id: number) {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Category',
            body: 'Are you sure you want to delete this category?',
            bodyBold: 'Children of this category will not be deleted.',
            ok: 'Delete'
        }).onDone.subscribe(() => {
            this.api.deleteCategory(id).subscribe(() => this.onChange.emit());
        });
    }

    /**
     * Detach specified category from parent if user confirms.
     */
    public maybeDetachCategory(id: number) {
        this.modal.show(ConfirmModalComponent, {
            title: 'Detach Category',
            body:  'Are you sure you want to detach this category from its parent?',
            ok:    'Detach'
        }).onDone.subscribe(() => {
            this.api.detachCategory(id).subscribe(() => this.onChange.emit());
        });
    }

    /**
     * Select specified category and navigate to articles list route.
     */
    public navigateToArticlesList(category: Category) {
        let ids = [category.id];
        if (category.parent_id) ids.push(category.parent_id);
        this.storage.set('selectedCategories', ids);

        this.router.navigate(['/help-center/manage/articles']);
    }
}

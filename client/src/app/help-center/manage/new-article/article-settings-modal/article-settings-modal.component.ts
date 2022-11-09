import {Component, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {BaseModalClass} from "../../../../shared/modal/base-modal";
import {utils} from "../../../../shared/utils";
import {Article} from "../../../../shared/models/Article";

@Component({
    selector: 'article-settings-modal',
    templateUrl: './article-settings-modal.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ArticleSettingsModalComponent extends BaseModalClass {
    @Output() public onDone  = new EventEmitter();
    @Output() public onClose = new EventEmitter();

    /**
     * Model for article settings fields.
     */
    public model: {slug?: string, description?: string, position?: number|string} = {};

    /**
     * ArticleSettingsModal Constructor.
     */
    constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
        super(elementRef, renderer);
    }

    /**
     * Close modal.
     */
    public close() {
        this.model = {};
        super.close();
    }

    /**
     * Open modal.
     */
    public show(params: {article: Article}) {
        this.model.slug = params.article.slug;
        this.model.description = params.article.description;
        this.model.position = params.article.position;
        super.show(params);
    }

    /**
     * Confirm modal actions.
     */
    public confirm() {
        super.done({
            slug: utils.slugifyString(this.model.slug),
            description: this.model.description,
            position: parseInt(this.model.position as string),
        });
    }
}
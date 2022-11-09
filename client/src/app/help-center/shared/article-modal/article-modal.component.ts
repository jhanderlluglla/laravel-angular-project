import {Component, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {Article} from "../../../shared/models/Article";
import {BaseModalClass} from "../../../shared/modal/base-modal";

@Component({
    selector: 'article-modal',
    templateUrl: './article-modal.component.html',
    styleUrls: ['./article-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ArticleModalComponent extends BaseModalClass {

    /**
     * Help center article model.
     */
    public article: Article;

    /**
     * ArticleModal Constructor.
     */
    constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
        super(elementRef, renderer);
    }

    /**
     * Show specified article.
     */
    public show(params: {article: Article}) {
        this.article = params.article;
        super.show(params);
    }
}
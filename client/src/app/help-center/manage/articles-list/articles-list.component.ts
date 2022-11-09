import {Component, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl} from "@angular/forms";
import {UrlAwarePaginator} from "../../../shared/pagination/url-aware-paginator.service";
import {ModalService} from "../../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../../shared/modal/confirm-modal/confirm-modal.component";
import {ArticlesListFiltersComponent} from "./articles-list-filters/articles-list-filters.component";
import {ArticlesOrderSelectComponent} from "../../shared/articles-order-select/articles-order-select.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {Article} from "../../../shared/models/Article";

@Component({
    selector: 'articles-list',
    templateUrl: './articles-list.component.html',
    styleUrls: ['./articles-list.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})
export class ArticlesListComponent implements AfterViewInit, OnDestroy {
    @ViewChild(ArticlesOrderSelectComponent) articlesOrder: ArticlesOrderSelectComponent;
    @ViewChild(ArticlesListFiltersComponent) articlesListFilters: ArticlesListFiltersComponent;

    /**
     * Article list search bar control.
     */
    public searchQuery = new FormControl();

    /**
     * Currently selected layout for article list.
     */
    public selectedLayout = 'grid';

    /**
     * ArticleListComponent Constructor.
     */
    constructor(
        private helpCenter: HelpCenterService,
        private router: Router,
        public paginator: UrlAwarePaginator,
        private modal: ModalService,
    ) {}

    ngAfterViewInit() {
        this.searchQuery.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(query => this.reloadArticles());
    }

    /**
     * Open update page for give article.
     */
    public goToUpdateArticle(articleId: number) {
        this.router.navigate(['/help-center/manage/', 'articles', articleId, 'edit']);
    }

    /**
     * Delete selected articles if user confirms it.
     */
    public maybeDeleteArticle(article: Article) {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Article',
            body:  'Are you sure you want to delete this article?',
            ok:    'Delete'
        }).onDone.subscribe(() => {
            this.helpCenter.deleteArticles([article.id]).subscribe(() => this.paginator.refresh());
        });
    }

    /**
     * Set article list layout to specified one.
     */
    public setLayout(name: string) {
        this.selectedLayout = name;
    }

    /**
     * Check if specified layout is currently active.
     */
    public isLayoutActive(name: string) {
        return this.selectedLayout === name;
    }

    /**
     * Reload articles with current filter parameters.
     */
    public reloadArticles() {
        this.paginator.paginate('help-center/articles', this.getQueryParams()).subscribe();
    }

    /**
     * Get query parameters for backend call.
     */
    private getQueryParams() {
        let filters = this.articlesListFilters.getFilters(),
            merged  = {};

        //only specify filters with "thruthy" or 0 value
        for(let name in filters) {
            if (filters[name] || filters[name] === 0) {
                merged[name] = filters[name];
            }
        }

        //specify search query if there is any
        if (this.searchQuery.value) {
            merged['query'] = this.searchQuery.value
        }

        //specify articles order
        merged['orderBy'] = this.articlesOrder.selectedValue;

        return merged;
    }

    ngOnDestroy() {
        this.paginator.destroy();
    }
}

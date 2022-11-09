import {Component, OnInit, Input, ViewEncapsulation, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";
import {Article} from "../../../shared/models/Article";
import {DropdownComponent} from "../../../shared/dropdown/dropdown.component";
import {Router} from "@angular/router";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'suggested-articles-dropdown',
    templateUrl: './suggested-articles-dropdown.component.html',
    styleUrls: ['./suggested-articles-dropdown.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SuggestedArticlesDropdownComponent implements OnInit {
    @ViewChild(DropdownComponent) dropdown: DropdownComponent;

    /**
     * Placeholder text for search input.
     */
    @Input('placeholder') public placeholder: string;

    /**
     * If suggestion link should open in new page or same one (_blank or _self).
     */
    @Input('openInNewPage') public openInNewPage: boolean;

    /**
     * Help center search query control.
     */
    public searchQuery = new FormControl();

    /**
     * Articles found by last search.
     */
    public articles: Article[] = [];

    /**
     * If search is in progress at the moment.
     */
    public searching = false;

    /**
     * Whether at least one search has been performed.
     */
    public haveSearched = false;

    /**
     * HcSuggestedArticlesDropdown Constructor.
     */
    constructor(
        private helpCenter: HelpCenterService,
        public urls: HcUrls,
        private router: Router,
    ) {}
    
    public ngOnInit() {
        this.bindToSearchQueryControl();
    }

    /**
     * Navigate to all search results route.
     */
    public viewAllResults() {
        if ( ! this.searchQuery.value) return;
        this.router.navigate(this.urls.getSearchPageLink(this.searchQuery.value));
    }

    /**
     * Clear search query and reset form control.
     */
    public resetSearchQuery() {
        this.searchQuery.reset();
    }

    /**
     * Search for help center articles matching specified query.
     */
    private searchArticles(query: string) {
        if ( ! query) return Observable.of({data: []});
        this.searching = true;
        return this.helpCenter.findArticles(query);
    }

    /**
     * Subscribe to search query changes and search for articles on changes.
     */
    private bindToSearchQueryControl() {
        this.searchQuery.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .switchMap(query => {
                return this.searchArticles(query);
            }).catch(() => {
                return Observable.of({data: []});
            }).subscribe(response => {
                this.setArticles(response.data);
                this.haveSearched = true;
                this.searching = false;
                this.dropdown.open();
            });
    }

    /**
     * Set specified articles on component.
     */
    private setArticles(articles: Article[]) {
        if ( ! articles) articles = [];
        this.articles = articles;
    }
}

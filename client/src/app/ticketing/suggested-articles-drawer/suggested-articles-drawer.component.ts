import {Component, Input, OnInit, EventEmitter, ViewEncapsulation, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {HelpCenterService} from "../../help-center/shared/help-center.service";
import {HcUrls} from "../../help-center/shared/hc-urls.service";
import {Article} from "../../shared/models/Article";
import {Tag} from "../../shared/models/Tag";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'suggested-articles-drawer',
    templateUrl: './suggested-articles-drawer.component.html',
    styleUrls: ['./suggested-articles-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SuggestedArticlesDrawerComponent implements OnInit {

    /**
     * Placeholder text for search input.
     */
    @Input() public placeholder: string;

    /**
     * Category that search should be filtered on.
     */
    @Input() public category: Tag;

    /**
     * Input field value emitter.
     */
    @Output() public inputValue = new EventEmitter();

    /**
     * Help center search query control.
     */
    public searchQuery = new FormControl();

    /**
     * Articles returned by search.
     */
    public articles: Article[] = [];

    /**
     * If search is in progress at the moment.
     */
    public searching = false;

    /**
     * SuggestedArticlesDrawer Constructor.
     */
    constructor(private helpCenter: HelpCenterService, public urls: HcUrls) {}

    public ngOnInit() {
        this.searchQuery.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .switchMap(query => {
                return this.searchArticles(query);
            }).catch(() => {
                return Observable.of([]);
            }).subscribe(response => {
                this.inputValue.emit(this.searchQuery.value);
                this.searching = false;
                this.setSearchResults(response.data);
            });
    }

    /**
     * Search help center articles by specified query.
     */
    private searchArticles(query: string) {
        if ( ! query) return Observable.of({data: []});

        this.searching = true;
        let params = {limit: 4, category: this.category ? this.category.name : null};

        return this.helpCenter.findArticles(query, params);
    }

    /**
     * Set specified search result on component instance.
     */
    private setSearchResults(articles: Article[]) {
        if ( ! articles || ! articles.length) {
            //if we've found no articles, wait until drawer
            //animation completes before removing old articles
            setTimeout(() => {
                this.articles = [];
            }, 300)
        } else {
            this.articles = articles;
        }
    }
}

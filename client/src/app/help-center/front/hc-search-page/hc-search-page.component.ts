import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HcUrls} from "../../shared/hc-urls.service";
import {SettingsService} from "../../../shared/settings.service";
import {Article} from "../../../shared/models/Article";
import {TitleService} from "../../../shared/title.service";

@Component({
    selector: 'hc-search-page',
    templateUrl: './hc-search-page.component.html',
    styleUrls: ['./hc-search-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HcSearchPageComponent implements OnInit {

    /**
     * Query search should be performed on.
     */
    public query: string;

    /**
     * How much articles to show per page.
     */
    public perPage: number = 20;

    /**
     * Search results.
     */
    public results: Article[];

    /**
     * HcSearchPageComponent Constructor.
     */
    constructor(
        private route: ActivatedRoute,
        private settings: SettingsService,
        public urls: HcUrls,
        private title: TitleService
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => this.query = params['query']);
        this.route.data.subscribe(data => this.results = data['results']);
        this.perPage = this.settings.get('hc.search_page.limit', 20);
        this.title.setSearchTitle(this.query);
    }
}

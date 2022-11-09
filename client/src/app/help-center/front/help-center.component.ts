import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {CurrentUser} from "../../auth/current-user";
import {ActivatedRoute} from "@angular/router";
import {HcUrls} from "../shared/hc-urls.service";
import {Category} from "../../shared/models/Category";
import {TitleService} from "../../shared/title.service";

@Component({
    selector: 'help-center',
    templateUrl: './help-center.component.html',
    styleUrls: ['./help-center.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})
export class HelpCenterComponent implements OnInit {
    /**
     * All available categories.
     */
    public categories: Category[] = [];

    /**
     * CategoriesComponent Constructor.
     */
    constructor(
        public currentUser: CurrentUser,
        public urls: HcUrls,
        private route: ActivatedRoute,
        private title: TitleService,
    ) {}

    ngOnInit() {
        this.title.setHomeTitle();
        this.categories = this.route.snapshot.data['categories'];
    }
}

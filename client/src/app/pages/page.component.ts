import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Pages} from "../admin/pages/pages.service";
import {ActivatedRoute} from "@angular/router";
import {Page} from "../shared/models/Page";

@Component({
    selector: 'page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PageComponent implements OnInit {

    /**
     * Page model instance.
     */
    public page: Page = new Page;

    /**
     * PagesComponent Constructor.
     */
    constructor(private pages: Pages, private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pages.get(params['id']).subscribe(page => {
                this.page = page;
            })
        })
    }
}

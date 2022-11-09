import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HcUrls} from "../../shared/hc-urls.service";
import {HelpCenterService} from "../../shared/help-center.service";
import {Category} from "../../../shared/models/Category";
import {Article} from "../../../shared/models/Article";
import {TitleService} from "../../../shared/title.service";

@Component({
    selector: 'category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss', './category-articles.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class CategoryComponent implements OnInit {

    /**
     * Category model.
     */
    public category: Category;

    /**
     * List of articles belonging to this category.
     */
    public articles: Article[] = [];

    /**
     * CategoryComponent Constructor.
     */
    constructor(
        private route: ActivatedRoute,
        private helpCenter: HelpCenterService,
        public urls: HcUrls,
        private title: TitleService
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.category = data['resolves']['category'];
            this.articles = data['resolves']['articles'];
            this.title.setCategoryTitle(this.category);
        });
    }

    /**
     * Reload articles in specified order.
     */
    public reloadArticles(order: string) {
        let params = {
            categories: this.route.snapshot.params['categoryId'],
            orderBy: order
        };

        this.helpCenter.getArticles(params).subscribe(response => {
            this.articles = response.data;
        });
    }
}

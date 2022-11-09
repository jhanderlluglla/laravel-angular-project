import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Article} from "../../../shared/models/Article";
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";
import {TitleService} from "../../../shared/title.service";

@Component({
    selector: 'article-host',
    templateUrl: './article-host.component.html',
    styleUrls: ['./article-host.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ArticleHostComponent implements OnInit {

    /**
     * Article model.
     */
    public article: Article;

    public relatedArticles: Article[] = [];

    /**
     * ArticleHostComponent Constructor.
     */
    constructor(
        private route: ActivatedRoute,
        private helpCenter: HelpCenterService,
        public urls: HcUrls,
        private title: TitleService,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.article = data['article'];
            this.fetchRelatedArticles(this.article);
            this.title.setArticleTitle(this.article);
        });
    }

    private fetchRelatedArticles(article: Article) {
        if ( ! this.article.categories || ! this.article.categories.length) return;

        this.helpCenter.getArticles({categories: article.categories[0].id}).subscribe(response => {
            this.relatedArticles = response.data;
        });
    }
}

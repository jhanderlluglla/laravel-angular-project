import {AfterViewInit, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser'
import {HelpCenterService} from "../help-center.service";
import {Article} from "../../../shared/models/Article";
import prismjs from 'prismjs';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';

@Component({
    selector: 'article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ArticleComponent implements OnInit, AfterViewInit {

    /**
     * Full article model, if this is passed in
     * there's no need to fetch article by url params.
     */
    @Input() public article: Article;

    /**
     * Trusted article body (includes html) for the view.
     */
    public trustedArticleBody: SafeHtml;

    /**
     * ArticleComponent Constructor.
     */
    constructor(
        private sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private helpCenter: HelpCenterService,
    ) {}

    ngOnInit() {
        if (this.article) return this.initArticle(this.article);

        this.route.data.subscribe(data => {
            if (data['article']) {
                this.initArticle(data['article']);
            } else {
                this.getArticle(this.route.snapshot.params);
            }
        });
    }

    ngAfterViewInit() {
        prismjs && prismjs.highlightAll();
    }

    /**
     * Initiate article component.
     */
    private initArticle(article: Article) {
        this.article = article;
        this.trustedArticleBody = this.sanitizer.bypassSecurityTrustHtml(article.body);
    }

    /**
     * Fetch help center article specified in url params.
     */
    private getArticle(urlParams) {
        this.helpCenter.getArticle(urlParams['article']).subscribe(response => {
            this.initArticle(response.data);
        }, () => {
            this.router.navigate(['/help-center']);
        })
    }
}

import {KarmaTest} from "../../../../../testing/karma-test";
import {ArticleHostComponent} from "./article-host.component";
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../../testing/stubs/activated-route-stub";
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";
import {TopicsPanelComponent} from "../topics-panel/topics-panel.component";
import {BreadCrumbsComponent} from "../breadcrumbs/breadcrumbs.component";
import {HcCompactHeaderComponent} from "../hc-compact-header/hc-compact-header.component";
import {CustomerFooterComponent} from "../../../shared/customer-footer/customer-footer.component";
import {SuggestedArticlesDropdownComponent} from "../suggested-articles-dropdown/suggested-articles-dropdown.component";
import {CustomerNavbarComponent} from "../../../shared/customer-navbar/customer-navbar.component";
import {LoggedInUserWidgetComponent} from "../../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {ArticleComponent} from "../../shared/article/article.component";
import {ArticleFeedbackComponent} from "../../shared/article-feedback/article-feedback.component";
import {CustomMenuComponent} from "../../../shared/custom-menu/custom-menu.component";
import {TitleService} from "../../../shared/title.service";
import {AuthService} from "../../../auth/auth.service";

describe('ArticleHost', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    ArticleHostComponent, TopicsPanelComponent, BreadCrumbsComponent, HcCompactHeaderComponent, ArticleComponent, ArticleFeedbackComponent,
                    CustomerFooterComponent, SuggestedArticlesDropdownComponent, CustomerNavbarComponent, LoggedInUserWidgetComponent, CustomMenuComponent,
                ],
                providers: [HcUrls, HelpCenterService, TitleService, AuthService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
            },
            component: ArticleHostComponent
        });
    });

    it('sets article from route data', () => {
        const article = {title: 'foo', categories: testBed.fake('Category', 2)};
        testBed.get(ActivatedRoute)['testData'] = {article};
        testBed.fixture.detectChanges();
        expect(testBed.component.article).toEqual(article);
    });

    it('renders hc header and breadcrumbs', () => {
        const article = {title: 'foo', categories: testBed.fake('Category', 2)};
        testBed.get(ActivatedRoute)['testData'] = {article};
        testBed.fixture.detectChanges();

        //renders header component
        expect(testBed.getChildComponent(HcCompactHeaderComponent)).toBeTruthy();

        //renders breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent)).toBeTruthy();

        //passes article model to breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent).resource).toEqual(article);

        //sets resource type as article on breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent).resourceType).toEqual('article');
    });

    it('renders article component', () => {
        const article = {title: 'foo', categories: testBed.fake('Category', 2)};
        testBed.get(ActivatedRoute)['testData'] = {article};
        testBed.fixture.detectChanges();

        expect(testBed.getChildComponent(ArticleComponent)).toBeTruthy();
        expect(testBed.getChildComponent(ArticleComponent).article).toEqual(article);
    });

    it('renders custom navbar component', () => {
        expect(testBed.getChildComponent(CustomerFooterComponent)).toBeTruthy();
    });
});
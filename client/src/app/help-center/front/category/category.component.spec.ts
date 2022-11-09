import {KarmaTest} from "../../../../../testing/karma-test";
import {CategoryComponent} from "./category.component";
import {HcUrls} from "../../shared/hc-urls.service";
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../../testing/stubs/activated-route-stub";
import {CustomerFooterComponent} from "../../../shared/customer-footer/customer-footer.component";
import {TopicsPanelComponent} from "../topics-panel/topics-panel.component";
import {BreadCrumbsComponent} from "../breadcrumbs/breadcrumbs.component";
import {HcCompactHeaderComponent} from "../hc-compact-header/hc-compact-header.component";
import {ArticlesOrderSelectComponent} from "../../shared/articles-order-select/articles-order-select.component";
import {CustomerNavbarComponent} from "../../../shared/customer-navbar/customer-navbar.component";
import {SuggestedArticlesDropdownComponent} from "../suggested-articles-dropdown/suggested-articles-dropdown.component";
import {LoggedInUserWidgetComponent} from "../../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {BehaviorSubject} from "rxjs";
import {CustomMenuComponent} from "../../../shared/custom-menu/custom-menu.component";
import {TitleService} from "../../../shared/title.service";
import {AuthService} from "../../../auth/auth.service";

describe('CategoryComponent', () => {
    let testBed: KarmaTest<any>;
    let resolves;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    CategoryComponent, CustomerFooterComponent, TopicsPanelComponent, BreadCrumbsComponent, LoggedInUserWidgetComponent,
                    HcCompactHeaderComponent, ArticlesOrderSelectComponent, CustomerNavbarComponent, SuggestedArticlesDropdownComponent,
                    CustomMenuComponent,
                ],
                providers: [HelpCenterService, HcUrls, TitleService, AuthService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
            },
            component: CategoryComponent
        });

        resolves = {category: {name: 'foo'}, articles: testBed.fake('Article', 2)};
        testBed.get(ActivatedRoute)['testData'] = {resolves};
    });

    it('sets route resolves on component instance', () => {
        testBed.fixture.detectChanges();

        expect(testBed.component.category).toEqual(resolves.category);
        expect(testBed.component.articles).toEqual(resolves.articles);
    });

    it('reloads articles', () => {
        testBed.get(ActivatedRoute)['testParams'] = {categoryId: 1};
        spyOn(testBed.get(HelpCenterService), 'getArticles').and.returnValue(new BehaviorSubject({data: [{title: 'foo'}]}));

        testBed.component.reloadArticles('order');

        //calls backend with correct params
        expect(testBed.get(HelpCenterService).getArticles).toHaveBeenCalledWith({orderBy: 'order', categories: 1});

        //sets returned articles on component
        expect(testBed.component.articles).toEqual([{title: 'foo'}]);
    });

    it('renders hc header and breadcrumbs', () => {
        testBed.fixture.detectChanges();

        //renders header component
        expect(testBed.getChildComponent(HcCompactHeaderComponent)).toBeTruthy();

        //renders breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent)).toBeTruthy();

        //passes article model to breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent).resource).toEqual(testBed.component.category);

        //sets resource type as article on breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent).resourceType).toEqual('category');
    });

    it('renders category name and articles order select component', () => {
        testBed.component.category = {name: 'foo'};
        testBed.fixture.detectChanges();

        //renders category name
        expect(testBed.find('.title > .text').textContent).toEqual(testBed.component.category.name);

        //renders articles order select
        expect(testBed.getChildComponent(ArticlesOrderSelectComponent)).toBeTruthy();

        //reloads articles on articles order select "onChange" event
        spyOn(testBed.component, 'reloadArticles');
        testBed.getChildComponent(ArticlesOrderSelectComponent).onChange.emit('foo bar');
        expect(testBed.component.reloadArticles).toHaveBeenCalledWith('foo bar');
    });

    it('renders articles list', () => {
        testBed.fixture.detectChanges();

        let articles = testBed.findAll('.article');

        //renders both articles
        expect(articles.length).toEqual(resolves.articles.length);

        //renders article link
        expect(articles[0]['href']).toContain(resolves.articles[0].id+'/'+resolves.articles[0].slug);

        //renders article title
        expect(articles[0].querySelector('.title').textContent).toEqual(resolves.articles[0].title);

        //renders article body
        expect(articles[0].querySelector('.body').textContent).toEqual(resolves.articles[0].body);
    });

    it('renders topics panel component', () => {
        testBed.component.category = {name: 'foo'};

        testBed.fixture.detectChanges();

        expect(testBed.getChildComponent(TopicsPanelComponent)).toBeTruthy();
        expect(testBed.getChildComponent(TopicsPanelComponent).category).toEqual({name: 'foo'});
    });

    it('renders customer footer component', () => {
       expect(testBed.getChildComponent(CustomerFooterComponent)).toBeTruthy();
    });
});
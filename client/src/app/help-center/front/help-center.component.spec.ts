import {KarmaTest} from "../../../../testing/karma-test";
import {HelpCenterComponent} from "./help-center.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {HcHeaderComponent} from "./hc-header/hc-header.component";
import {CustomerFooterComponent} from "../../shared/customer-footer/customer-footer.component";
import {SuggestedArticlesDropdownComponent} from "./suggested-articles-dropdown/suggested-articles-dropdown.component";
import {CustomerNavbarComponent} from "../../shared/customer-navbar/customer-navbar.component";
import {LoggedInUserWidgetComponent} from "../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {HcUrls} from "../shared/hc-urls.service";
import {HelpCenterService} from "../shared/help-center.service";
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../testing/stubs/activated-route-stub";
import {CustomMenuComponent} from "../../shared/custom-menu/custom-menu.component";
import {TitleService} from "../../shared/title.service";
import {AuthService} from "../../auth/auth.service";

describe('HelpCenterComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [HelpCenterComponent, HcHeaderComponent, CustomerFooterComponent, SuggestedArticlesDropdownComponent, CustomerNavbarComponent, LoggedInUserWidgetComponent, CustomMenuComponent],
                providers: [UrlAwarePaginator, HcUrls, HelpCenterService, TitleService, AuthService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
            },
            component: HelpCenterComponent
        });
    });

    it('sets categories on component on init', () => {
        testBed.get(ActivatedRoute)['testData'] = {categories: [{name: 'foo', children: []}]};
        testBed.fixture.detectChanges();
        expect(testBed.component.categories).toEqual([{name: 'foo', children: []}]);
    });

    it('renders "HcHeader" and "CustomoerFooter" component', () => {
        expect(testBed.getChildComponent(HcHeaderComponent)).toBeTruthy();
        expect(testBed.getChildComponent(CustomerFooterComponent)).toBeTruthy();
    });

    it('renders parent categories', () => {
        testBed.get(ActivatedRoute)['testData'] = {categories: [
            {id: 1, name: 'foo', description: 'foo-bar', children: [{articles: [{}]}]},
            {name: 'bar', children: [{articles: [{}]}]},
            {name: 'baz', hidden: 1, children: [{articles: [{}]}]},
        ]};
        testBed.fixture.detectChanges();

        let categories = testBed.findAll('.category');

        //renders 2 parents (1 should be hidden)
        expect(categories.length).toEqual(2);

        //renders parent name and link
        expect(categories[0].querySelector('.category-name > a').textContent).toEqual(testBed.component.categories[0].name);
        expect(categories[0].querySelector('.category-name > a')['href']).toContain(
            testBed.component.categories[0].id+'/'+testBed.component.categories[0].name
        );

        //renders parent description
        expect(categories[0].querySelector('.category-description').textContent).toEqual(testBed.component.categories[0].description);
    });

    it('renders child categories', () => {
        testBed.get(ActivatedRoute)['testData'] = {categories: [{children: [
            {id: 1, name: 'foo', articles_count: 6, articles: [{id: 2, title: 'foo-article'}, {title: 'bar-article'}]},
            {name: 'bar', articles_count: 5, articles: [{}]}]},
            {name: 'baz', hidden: 1, articles: [{}]},
        ]};
        testBed.fixture.detectChanges();

        let categories = testBed.findAll('.child-category');

        //renders 2 children (1 should be hidden)
        expect(categories.length).toEqual(2);

        //renders child name
        expect(categories[0].querySelector('.child-category-name > a').textContent).toContain(testBed.component.categories[0].children[0].name);

        //renders child article count
        expect(categories[0].querySelector('.child-category-name > a').textContent).toContain(testBed.component.categories[0].children[0].articles_count);

        //renders child link
        expect(categories[0].querySelector('.child-category-name > a')['href']).toContain(
            testBed.component.categories[0].children[0].id+'/'+testBed.component.categories[0].children[0].name
        );

        let articles = categories[0].querySelectorAll('.article');

        //renders both articles
        expect(articles.length).toEqual(2);

        //renders article title
        expect(articles[0].textContent.trim()).toEqual(testBed.component.categories[0].children[0].articles[0].title);

        //renders article link
        expect(articles[0]['href']).toContain(
            testBed.component.categories[0].children[0].articles[0].id+'/'+testBed.component.categories[0].children[0].articles[0].title
        );
    });
});
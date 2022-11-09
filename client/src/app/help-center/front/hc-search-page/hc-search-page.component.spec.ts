import {KarmaTest} from "../../../../../testing/karma-test";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";
import {HcSearchPageComponent} from "./hc-search-page.component";
import {ActivatedRouteStub} from "../../../../../testing/stubs/activated-route-stub";
import {HcCompactHeaderComponent} from "../hc-compact-header/hc-compact-header.component";
import {CustomerFooterComponent} from "../../../shared/customer-footer/customer-footer.component";
import {CustomerNavbarComponent} from "../../../shared/customer-navbar/customer-navbar.component";
import {SuggestedArticlesDropdownComponent} from "../suggested-articles-dropdown/suggested-articles-dropdown.component";
import {LoggedInUserWidgetComponent} from "../../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {HcSearchPageResolve} from "./hc-search-page-resolve.service";
import {CustomMenuComponent} from "../../../shared/custom-menu/custom-menu.component";
import {TitleService} from "../../../shared/title.service";
import {AuthService} from "../../../auth/auth.service";

describe('HcSearchPageComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    HcSearchPageComponent, HcCompactHeaderComponent, CustomerFooterComponent, CustomMenuComponent,
                    CustomerNavbarComponent, SuggestedArticlesDropdownComponent, LoggedInUserWidgetComponent
                ],
                providers: [HelpCenterService, HcUrls, TitleService, AuthService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}, HcSearchPageResolve],
            },
            component: HcSearchPageComponent,
        });
    });

    it('renders header', () => {
        testBed.get(ActivatedRoute)['testParams'] = {query: 'foo query'};
        testBed.fixture.detectChanges();

        //renders "back" button
        expect(testBed.find('.back')['href']).toBeTruthy();

        //renders search info
        expect(testBed.find('.info').textContent).toContain(testBed.component.perPage);
        expect(testBed.find('.info').textContent).toContain(testBed.component.query);
    });

    it('renders articles list', () => {
        testBed.get(ActivatedRoute)['testData'] = {results: [{id: 1, title: 'foo', body: 'bar', categories: [{id: 2, name: 'child', parent: {id: 3, name: 'parent'}}]}, {id: 4, categories: []}]};
        testBed.fixture.detectChanges();

        //renders title
        expect(testBed.find('.article .title').textContent).toEqual('foo');

        //renders body
        expect(testBed.find('.article .body').textContent).toEqual('bar');

        //renders path
        expect(testBed.find('.article .path .parent').textContent).toEqual('parent');
        expect(testBed.find('.article .path .parent')['href']).toContain('3/parent');
        expect(testBed.find('.article .path .child').textContent).toEqual('child');
        expect(testBed.find('.article .path .child')['href']).toContain('2/child');
    });
});
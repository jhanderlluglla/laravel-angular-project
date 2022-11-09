import {KarmaTest} from "../../../../testing/karma-test";
import {MailboxComponent} from "./mailbox.component";
import {AgentNavbarComponent} from "../../shared/agent-navbar/agent-navbar.component";
import {LoggedInUserWidgetComponent} from "../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {TicketSearchDropdownComponent} from "../../shared/ticket-search-dropdown/ticket-search-dropdown.component";
import {MailboxTagsService} from "../mailbox-tags.service";
import {ActivatedRoute, RouterOutlet} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../auth/auth.service";

describe('MailboxComponent', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [MailboxComponent, AgentNavbarComponent, LoggedInUserWidgetComponent, TicketSearchDropdownComponent],
                providers: [
                    MailboxTagsService, AuthService,
                    {
                        provide: ActivatedRoute, useValue: {
                            params: Observable.of({}),
                            firstChild: {params: Observable.of({})}
                        }
                    }
                ],
            },
            component: MailboxComponent
        });
    });

    it('renders mailbox status tags', () => {
        testBed.get(MailboxTagsService).statusTags = [testBed.fake('Tag', 1, {id: 1, tickets_count: 1, name: 'foo', display_name: 'foo'}), testBed.fake('Tag', 1, {id: 2, tickets_count: 2, name: 'closed'})];
        testBed.fixture.detectChanges();

        //2 tags are rendered
        expect(testBed.findAll('.status-tag').length).toEqual(2);

        //router-link-active class is added
        testBed.get(MailboxTagsService).activeTag = testBed.fake('Tag', 1, {id: 1});
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.status-tag > a')[0].classList.contains('router-link-active')).toEqual(true);

        //correct "href" attribute is added
        expect(testBed.findAll('.status-tag > a')[0]['href']).toContain('/mailbox/tickets/tag/1');

        //tag name is rendered
        expect(testBed.findAll('.status-tag')[0].querySelector('.tag-name').textContent).toEqual('foo');

        //tickets count is rendered
        expect(testBed.findAll('.status-tag')[0].querySelector('.tickets-count').textContent).toEqual('1');

        //tickets count is hidden for "closed" tag
        expect(testBed.findAll('.status-tag')[1].querySelector('.tickets-count').classList.contains('hidden')).toBeTruthy();
    });

    it('renders mailbox category tags', () => {
        testBed.get(MailboxTagsService).categoryTags = [testBed.fake('Tag', 1, {id: 1, tickets_count: 1, name: 'foo', display_name: 'foo'}), testBed.fake('Tag', 1, {id: 2, tickets_count: 2, name: 'bar'})];
        testBed.fixture.detectChanges();

        //2 tags are rendered
        expect(testBed.findAll('.category-tag').length).toEqual(2);

        //router-link-active class is added
        testBed.get(MailboxTagsService).activeTag = testBed.fake('Tag', 1, {id: 1});
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.category-tag > a')[0].classList.contains('router-link-active')).toEqual(true);

        //correct "href" attribute is added
        expect(testBed.findAll('.category-tag > a')[0]['href']).toContain('/mailbox/tickets/tag/1');

        //tag name is rendered
        expect(testBed.findAll('.category-tag')[0].querySelector('.tag-name').textContent).toEqual('foo');

        //tickets count is rendered
        expect(testBed.findAll('.category-tag')[0].querySelector('.tickets-count').textContent).toEqual('1');
    });

    it('renders agent navbar and router outlet', () => {
        expect(testBed.getChildComponent(AgentNavbarComponent)).toBeTruthy();
        expect(testBed.getChildComponent(RouterOutlet)).toBeTruthy();
    });
});
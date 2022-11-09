import {KarmaTest} from "../../../../../testing/karma-test";
import {BehaviorSubject} from "rxjs";
import {TicketsService} from "../../tickets.service";
import {MailboxTagsService} from "../../mailbox-tags.service";
import {fakeAsync, tick} from "@angular/core/testing";
import {ModalService} from "../../../shared/modal/modal.service";
import {CannedRepliesDropdownComponent} from "./canned-replies-dropdown.component";
import {CannedRepliesService} from "../canned-replies.service";
import {Conversation} from "../../../conversation/conversation.service";
import {DropdownComponent} from "../../../shared/dropdown/dropdown.component";
import {CrupdateCannedReplyModalComponent} from "../crupdate-canned-reply-modal/crupdate-canned-reply-modal.component";
import {CurrentUser} from "../../../auth/current-user";
import {Draft} from "../../../conversation/draft.service";
import {ConversationReplies} from "../../../conversation/conversation-replies.service";
import {AfterReplyAction} from "../../../conversation/after-reply-action.service";
import {TicketAttachmentsService} from "../../ticket-attachments.service";
import {UploadsService} from "../../../shared/uploads.service";
import {FileValidator} from "../../../shared/file-validator";

describe('CannedRepliesDropdown', () => {
    let testBed: KarmaTest<CannedRepliesDropdownComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [CannedRepliesDropdownComponent],
                providers: [
                    CannedRepliesService, Conversation, TicketsService, TicketAttachmentsService, FileValidator,
                    MailboxTagsService, Draft, ConversationReplies, AfterReplyAction, UploadsService
                ],
            },
            component: CannedRepliesDropdownComponent
        });
    });

    it('fetches available canned replies on first dropdown open', () => {
        spyOn(testBed.get(CurrentUser), 'get').and.returnValue(1);
        testBed.fixture.detectChanges();
        let cannedReplies = [{body: 'foo'}, {body: 'bar'}];

        //mock call to backend
        spyOn(testBed.get(CannedRepliesService), 'getReplies').and.returnValue(new BehaviorSubject(cannedReplies));

        //click dropdown trigger button
        testBed.find('dropdown').click();

        //assert that call to backend was made to fetch canned replies
        expect(testBed.get(CannedRepliesService).getReplies).toHaveBeenCalledWith({query: null, user_id: 1});
    });

    it('searches for canned replies when user types into input', fakeAsync(() => {
        testBed.fixture.detectChanges();
        let query = 'foo bar baz';

        //mock call to backend
        spyOn(testBed.get(CannedRepliesService), 'getReplies').and.returnValue(new BehaviorSubject([]));
        //type canned replies search input
        testBed.typeIntoEl('.input-container > input', query);
        tick(401);

        //assert that call to backend was made to fetch canned replies
        expect(testBed.get(CannedRepliesService).getReplies).toHaveBeenCalledWith(jasmine.objectContaining({query}));
    }));

    it('opens new canned reply modal', () => {
        const draft = testBed.fake('Reply');
        testBed.get(Conversation).draft.set(draft);
        testBed.fixture.detectChanges();

        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});

        //click new canned reply button
        testBed.find('.new-canned-reply').click();

        //assert "NewCannedReply" modal was opened
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(CrupdateCannedReplyModalComponent, {cannedReply: draft});
    });

    it('hides new canned reply button if user has typed anything into search field', () => {
        testBed.fixture.detectChanges();
        expect(testBed.find('.new-canned-reply')).toBeTruthy();

        //type into canned replies search input
        testBed.typeIntoEl('.input-container > input', 'foo bar');

        //assert new canned reply button was hidden
        expect(testBed.find('.new-canned-reply')).toBeFalsy();
    });

    it('renders available canned replies', () => {
        const cannedReplies = testBed.fake('CannedReply', 2);
        testBed.component.cannedReplies = cannedReplies;
        testBed.fixture.detectChanges();

        let els = testBed.findAll('.canned-reply');

        //assert canned replies were rendered properly in template
        expect(els.length).toEqual(2);
        expect(els[0].textContent.trim()).toEqual(cannedReplies[0].name);
    });

    it('lets user select canned reply', () => {
        const cannedReply = testBed.fake('CannedReply');
        testBed.component.cannedReplies = [cannedReply];
        testBed.fixture.detectChanges();
        testBed.getChildComponent(DropdownComponent).open();

        let eventFired: any = false;
        testBed.component.onReplySelect.subscribe(data => eventFired = data);

        //click on canned reply dropdown item
        testBed.find('.canned-reply').click();

        //assert "onReplySelect" event was fired
        expect(eventFired).toEqual(cannedReply);

        //asset dropdown was closed
        expect(testBed.find('dropdown').classList.contains('dropdown-open')).toEqual(false);
    });

    it('renders "no results found" message', () => {
        //assert message is hidden by default
        expect(testBed.find('.no-results')).toBeFalsy();

        testBed.component.cannedReplies = [];
        testBed.component.loadedResultsAtLeastOnce = false;
        testBed.component.searchQuery.setValue('foo bar');

        //assert message is hidden if there are no canned replies
        //but canned replies were not loaded from backend yet
        testBed.fixture.detectChanges();
        expect(testBed.find('.no-results')).toBeFalsy();

        //assert message is visible if all conditions are met
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.fixture.detectChanges();
        expect(testBed.find('.no-results')).toBeTruthy();
    });

    it('fetches available canned replies from backend', () => {
        let cannedReplies = testBed.fake('CannedReply', 2); let query = 'foo bar';

        //mock backend call
        spyOn(testBed.get(CannedRepliesService), 'getReplies').and.returnValue(new BehaviorSubject({data: cannedReplies}));

        testBed.component.getCannedReplies(query);

        //assert backend call was made to fetch available canned replies
        expect(testBed.get(CannedRepliesService).getReplies).toHaveBeenCalledWith(jasmine.objectContaining({query}));

        //assert loadedResultsAtLeastOnce was set to true
        expect(testBed.component.loadedResultsAtLeastOnce).toEqual(true);

        //assert canned replies returned from backend were set on component instance
        expect(testBed.component.cannedReplies).toEqual(cannedReplies);
    });
});
import {Component, ViewEncapsulation, Input, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {CurrentUser} from "../../auth/current-user";
import {ModalService} from "../../shared/modal/modal.service";
import {Conversation} from "../conversation.service";
import {Tag} from "../../shared/models/Tag";
import {Reply} from "../../shared/models/Reply";
import {TicketsService} from "../../ticketing/tickets.service";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {AddNoteModalComponent} from "../../ticketing/add-note-modal/add-note-modal.component";
import {ActivatedRoute, Router} from "@angular/router";
import {BrowserEvents} from "../../shared/browser-events.service";
import {AssignTicketDropdownComponent} from "../../ticketing/assign-ticket-dropdown/assign-ticket-dropdown.component";
import {AssignPriorityTicketDropdownComponent} from "../../ticketing/assign-priority-ticket-dropdown/assign-priority-ticket-dropdown.component";
import {AddTagDropdownComponent} from "../../ticketing/add-tag-dropdown/add-tag-dropdown.component";
import {DropdownComponent} from "../../shared/dropdown/dropdown.component";
import {DropdownService} from "../../shared/dropdown/dropdown.service";
import {RouterHistory} from "../../shared/router-history.service";

@Component({
    selector: 'conversation-toolbar',
    templateUrl: './conversation-toolbar.component.html',
    styleUrls: ['./conversation-toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationToolbarComponent implements OnInit, OnDestroy {
    @ViewChild(AssignTicketDropdownComponent) assignTicketDropdown: AssignTicketDropdownComponent;
    @ViewChild(AssignPriorityTicketDropdownComponent) assignPriorityTicketDropdown: AssignPriorityTicketDropdownComponent;
    @ViewChild(AddTagDropdownComponent) addTagDropdown: AddTagDropdownComponent;
    @ViewChild('ticketStatusDropdown') ticketStatusDropdown: DropdownComponent;

    /**
     * If back button should be visible.
     */
    @Input() hideBackButton = false;

    /**
     * Subscriptions that need to be unsubscribed.
     */
    private subscriptions = [];

    /**
     * ConversationHeader Constructor.
     */
    constructor(
        private router: Router,
        public injector: Injector,
        private modals: ModalService,
        private route: ActivatedRoute,
        public currentUser: CurrentUser,
        private tickets: TicketsService,
        public conversation: Conversation,
        private dropdowns: DropdownService,
        private routerHistory: RouterHistory,
        private browserEvents: BrowserEvents,
        private mailboxTags: MailboxTagsService,
    ) {}

    ngOnInit() {
        this.initKeybinds();
    }

    /**
     * Change ticket status to given one (open, closed, spam etc)
     */
    public changeTicketStatus(status: Tag) {
        if ( ! status) return;

        this.tickets.changeTicketStatus(this.conversation.get().id, status.name).subscribe(() => {
            this.conversation.performAfterReplyAction();
            this.conversation.setStatus(status);
        });
    }

    /**
     * Show modal for adding new note for current ticket.
     */
    public showNoteModal() {
        this.modals.show(AddNoteModalComponent, {ticketId: this.conversation.get().id})
            .onDone.subscribe(note => this.addNewNote(note));
    }

    /**
     * Add given tag to current ticket.
     */
    public addTag(tag: Tag) {
        this.conversation.addTag(tag);
        this.refreshMailboxTags();
    }

    /**
     * Push new note onto current tickets replies array.
     */
    public addNewNote(note: Reply) {
        if ( ! note) return;
        this.conversation.replies.add(note);
    }

    /**
     * Navigate back to tickets list page.
     */
    public navigateToTicketsList() {
        if (this.routerHistory.getPrevious()) {
            this.routerHistory.back();
        } else {
            this.router.navigate(['../../'], {relativeTo: this.route});
        }
    }

    /**
     * Refresh mailbox tags and ticket counters.
     */
    public refreshMailboxTags() {
        this.mailboxTags.refresh();
    }

    /**
     * Init keybinds for conversation toolbar.
     */
    private initKeybinds() {
        let sub = this.browserEvents.globalKeyDown$.subscribe(e => {
            let handled = true;

            //if any modals are open or user is currently typing, bail
            if (this.modals.anyOpen() || BrowserEvents.userIsTyping()) return;

            switch (e.keyCode) {
                //main toolbar actions
                case this.browserEvents.keyCodes.letters.b:
                    this.dropdowns.closeAll();
                    this.navigateToTicketsList();
                    break;
                case this.browserEvents.keyCodes.letters.a:
                    this.assignTicketDropdown.open();
                    break;
                case this.browserEvents.keyCodes.letters.p:
                    this.assignPriorityTicketDropdown.open();
                    break;
                case this.browserEvents.keyCodes.letters.n:
                    this.dropdowns.closeAll();
                    this.showNoteModal();
                    break;
                case this.browserEvents.keyCodes.letters.t:
                    this.addTagDropdown.open();
                    break;
                case this.browserEvents.keyCodes.letters.s:
                    if (this.ticketStatusDropdown.isOpen) {
                        this.handleTicketStatusChangeKeybind('spam');
                    } else {
                        this.ticketStatusDropdown.open();
                    }
                    break;

                //change ticket status
                case this.browserEvents.keyCodes.letters.o:
                    this.handleTicketStatusChangeKeybind('open');
                    break;
                case this.browserEvents.keyCodes.letters.c:
                    this.handleTicketStatusChangeKeybind('closed');
                    break;
                case this.browserEvents.keyCodes.letters.p:
                    this.handleTicketStatusChangeKeybind('pending');
                    break;
                default:
                    handled = false;
            }

            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.subscriptions.push(sub);
    }

    /**
     * Change ticket status so specified one and close dropdown.
     */
    private handleTicketStatusChangeKeybind(status: string) {
        if ( ! this.ticketStatusDropdown.isOpen) return;
        this.changeTicketStatus(this.mailboxTags.getTagByName(status));
        this.ticketStatusDropdown.close();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription && subscription.unsubscribe();
        });
    }
}

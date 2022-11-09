import {Injectable} from "@angular/core";
import {SettingsService} from "../shared/settings.service";
import {TicketsService} from "../ticketing/tickets.service";
import {MailboxTagsService} from "../ticketing/mailbox-tags.service";
import {Router} from "@angular/router";
import {ToastService} from "../shared/toast/toast.service";

@Injectable()
export class AfterReplyAction {

    /**
     * Where/if to redirect after reply is submitted.
     */
    public defaultAction: string;

    /**
     * Id of currently active ticket.
     */
    private activeTicketId: number;

    /**
     * AfterReplyAction Constructor.
     */
    constructor(
        private router: Router,
        private toast: ToastService,
        private tickets: TicketsService,
        private settings: SettingsService,
        private mailboxTags: MailboxTagsService,
    ) {
        this.defaultAction = this.settings.get('replies.after_reply_action', 'next_active_ticket');
    }

    /**
     * Perform after reply action.
     */
    public perform() {
        //we're currently in help center tickets list
        if (this.router.url.indexOf('help-center') > -1) {
            this.navigateToCustomerTicketsList();
            return;
        }

        switch (this.defaultAction) {
            case 'next_active_ticket':
                this.navigateToNextActiveTicket();
                break;
            case 'back_to_folder':
                this.navigateToAgentTicketsList();
                break;
        }

        this.mailboxTags.refresh();
    }

    /**
     * Get currently active after redirect action.
     */
    public get() {
        return this.defaultAction;
    }

    /**
     * Change default action that is applied after reply submit.
     */
    public set(value: string = null) {
        this.defaultAction = value;
        let params = {'replies.after_reply_action': value};
        this.settings.save(params).subscribe();
    }

    /**
     * Set currently active ticket id.
     */
    public setTicketId(id: number) {
        this.activeTicketId = id;
    }

    /**
     * Navigate to next active ticket belonging to currently active tag.
     */
    private navigateToNextActiveTicket() {
        const tagId = this.mailboxTags.getActiveTagId();

        this.tickets.getLatestActiveTicket(tagId).subscribe(ticket => {
            if (ticket && ticket.id !== this.activeTicketId) {
                this.router.navigate(['/mailbox/tickets/tag/', tagId, 'ticket', ticket.id]);
            } else {
                this.navigateToAgentTicketsList();
            }
        });
    }

    /**
     * Navigate back to tickets list for currently active tag.
     */
    private navigateToAgentTicketsList() {
        this.router.navigate(['/mailbox/tickets/tag/' + this.mailboxTags.getActiveTagId()]);
    }

    /**
     * Navigate back to customers ticket list.
     */
    private navigateToCustomerTicketsList() {
        this.router.navigate(['/help-center/tickets']);
        this.toast.show('Your reply was submitted successfully.');
    }
}
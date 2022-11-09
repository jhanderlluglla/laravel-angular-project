import {Injectable} from "@angular/core";
import {Reply} from "../shared/models/Reply";
import {TicketsService} from "../ticketing/tickets.service";
import {ToastService} from "../shared/toast/toast.service";

@Injectable()
export class ConversationReplies {

    /**
     * Current conversation replies.
     */
    private replies: Reply[] = [];

    /**
     * Current replies infinite load page.
     */
    public currentPage = 1;

    /**
     * Last replies infinite load page.
     */
    public lastPage = 2;

    /**
     * Whether replies are currently being loaded.
     */
    public isLoading = false;

    /**
     * ID of currently active ticket.
     */
    private ticketId: number;

    /**
     * ConversationReplies service constructor.
     */
    constructor(private tickets: TicketsService, private toast: ToastService) {}

    /**
     * Get current conversation replies.
     */
    public get() {
        return this.replies;
    }

    /**
     * Add specified reply.
     */
    public add(reply: Reply) {
        //if specified reply does not have ID, bail
        if ( ! reply || ! reply.id) return;

        //if reply does not already exist, add it to replies array
        if ( ! this.replies.find(existing => existing.id == reply.id)) {
            this.replies.unshift(reply);
        }
    }

    /**
     * Replace existing reply with specified one.
     */
    public replace(newReply: Reply) {
        let index = this.replies.findIndex(oldReply => oldReply.id == newReply.id);
        this.replies[index] = newReply;
    }

    /**
     * Remove specified reply.
     */
    public remove(replyId: number) {
        this.replies = this.replies.filter(reply => reply.id != replyId);
    }

    /**
     * Delete specified reply from server.
     */
    public delete(reply: Reply) {
        let method = reply.type === 'drafts' ? 'deleteDraft' : 'deleteReply';

        this.tickets[method](reply.id).subscribe(() => {
            this.remove(reply.id);
            this.toast.show('Deleted successfully');
        });
    }

    /**
     * Load next page of replies from the server.
     */
    public loadMore() {
        if (this.isLoading) return;

        this.isLoading = true;

        this.tickets.getReplies(this.ticketId, this.currentPage+1).subscribe(response => {
            this.replies = this.replies.concat(response.data);
            this.currentPage = response['current_page'];
            this.lastPage = response['last_page'];
            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }

    /**
     * Check if more replies can be loaded from the server.
     */
    public canLoadMore(): boolean {
        return this.currentPage < this.lastPage;
    }

    /**
     * Init or reset conversation replies service.
     */
    public init(replies: Reply[], ticketId: number) {
        this.replies = replies.slice();
        this.currentPage = 1;
        this.lastPage = 2;
        this.ticketId = ticketId;
    }
}
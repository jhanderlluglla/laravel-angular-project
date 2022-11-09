import {Injectable} from '@angular/core';
import {HttpClient} from "../shared/http-client";
import {Observable} from "rxjs";
import {Ticket} from "../shared/models/Ticket";
import {Tag} from "../shared/models/Tag";
import {Reply} from "../shared/models/Reply";

@Injectable()
export class TicketsService {

    /**
     * TicketsService Constructor.
     */
    constructor(private httpClient: HttpClient) { }

    /**
     * Fetch ticket matching specified id.
     */
    public get(id: number): Observable<Ticket> {
        return this.httpClient.get('tickets/'+id);
    }

    /**
     * Create a new ticket.
     */
    public create(payload: Object) {
        return this.httpClient.post('tickets', payload);
    }

    /**
     * Create new draft or update existing one.
     */
    public saveDraft(ticketId: number, payload: Object, draftId?: number): Observable<{data: Reply}> {
        if (draftId) {
            return this.httpClient.put('replies/'+draftId, payload);
        } else {
            return this.httpClient.post('tickets/'+ticketId+'/drafts', payload);
        }
    }

    /**
     * Create new reply for specified ticket.
     */
    public saveReply(ticketId: number, payload: Object) {
        return this.httpClient.post('tickets/'+ticketId+'/replies', payload);
    }

    /**
     * Get replies for given ticket.
     */
    public getReplies(ticketId: number, page = 1) {
        return this.httpClient.get('tickets/'+ticketId+'/replies', {page});
    }

    /**
     * Add note to specified ticket.
     */
    public addNote(ticketId: number, params: Object) {
        return this.httpClient.post('tickets/'+ticketId+'/notes', params);
    }

    /**
     * Update existing reply or note with given contents.
     */
    public updateReply(replyId: number, payload) {
        return this.httpClient.put('replies/'+replyId, payload);
    }

    /**
     * Search all tickets current user has access to for given query.
     */
    public search(query: string, params: Object = {}) {
        return this.httpClient.get('search/all/'+encodeURIComponent(query), params);
    }

    /**
     * fetch tickets without pagination.
     */
    public getTickets(params): Observable<{data: Ticket[]}> {
        return this.httpClient.get('tickets', params);
    }

    /**
     * Add specified tag to tickets.
     */
    public addTag(tagName: string, ids: number[]) {
        return this.httpClient.post('tickets/tags/add', {ids, tag: tagName});
    }

    /**
     * Remove given tag from ticket matching given IDs.
     */
    public removeTag(tag: Tag, ids: number[]) {
        return this.httpClient.post('tickets/tags/remove', {ids, tag: tag.id});
    }

    /**
     * Change status of ticket from old tag to given tag.
     */
    public changeTicketStatus(ticketId: number, status: string) {
        return this.httpClient.post('tickets/status/change', {ids: [ticketId], status});
    }

    /**
     * Change status for given tickets to new one.
     */
    public changeMultipleTicketsStatus(ids: number[], newTag) {
        return this.httpClient.post('tickets/status/change', {ids, status: newTag.name});
    }

    /**
     * Assign ticket to specified user.
     */
    public assign(ticketIds: number[], userId: number = null) {
        return this.httpClient.post('tickets/assign', {user_id: userId, tickets: ticketIds});
    }

    /**
     * Assign ticket to specified priority.
     */
    public assignPriority(ticketIds: number[], priorityId: number = null) {
        return this.httpClient.post('tickets/assign-priority', {priority_id: priorityId, tickets: ticketIds});
    }

    /**
     * Assign tickets to specified group.
     */
    public assignToGroup(ticketIds: number[], groupId: number = null) {
        return this.httpClient.post('tickets/assign-group', {group: groupId, tickets: ticketIds});
    }

    /**
     * Delete tickets matching given ids.
     */
    public deleteMultiple(ids: number[]) {
        return this.httpClient.delete('tickets', {ids});
    }

    /**
     * Delete specified draft.
     */
    public deleteDraft(id: number) {
        return this.httpClient.delete('drafts/'+id);
    }

    /**
     * Delete specified reply of any type.
     */
    public deleteReply(id: number) {
        return this.httpClient.delete('replies/'+id);
    }

    /**
     * Get latest active ticket that has specified tag.
     */
    public getLatestActiveTicket(tagId: number): Observable<Ticket> {
        return this.httpClient.get('tickets?per_page=1&tag_id='+tagId).map(response => {
            return response.data.length ? response.data[0] : null;
        });
    }

    /**
     * Get original email from which reply was created.
     */
    public getOriginalEmailForReply(id: number): Observable<{data: string}> {
        return this.httpClient.get('replies/'+id+'/original');
    }

    /**
     * Merge specified tickets.
     */
    public merge(id1: number, id2: number): Observable<Ticket> {
        return this.httpClient.post('tickets/merge/'+id1+'/'+id2);
    }
}
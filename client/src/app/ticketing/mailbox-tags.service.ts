import {Injectable} from '@angular/core';
import {Tag} from "../shared/models/Tag";
import {HttpClient} from "../shared/http-client";

@Injectable()
export class MailboxTagsService {

    /**
     * All available tags.
     */
    public allTags: Tag[] = [];

    /**
     * Tags representing categories.
     */
    public categoryTags: Tag[] = [];

    /**
     * Ticket status tags (open, closed etc)
     */
    public statusTags: Tag[] = [];

    /**
     * Currently selected tag in mailbox.
     */
    public activeTag: Tag;

    /**
     * MailboxTagsService Constructor.
     */
    constructor(private httpClient: HttpClient) {}

    /**
     * Set specified tags on MailboxTags service.
     */
    public setTags(tags: Tag[]) {
        if ( ! tags) return;

        this.allTags      = tags;
        this.categoryTags = tags.filter(tag => tag.type === 'category');
        this.statusTags   = tags.filter(tag => tag.type === 'status');
    }

    /**
     * Refresh mailbox tags.
     */
    public refresh() {
        this.httpClient.get('tags/agent-mailbox').subscribe((tags: Tag[]) => {
            this.setTags(tags);
        });
    }

    /**
     * Check if currently active tag matches given id.
     */
    public activeTagIs(tagId: number): boolean {
        return this.activeTag && this.activeTag.id && this.activeTag.id == tagId;
    }

    /**
     * Get currently active tag ID.
     */
    public getActiveTagId(): number {
        if (this.activeTag) {
            return this.activeTag.id;
        }
    }

    /**
     * Set currently active tag based on current url
     * or default to 'open' tag.
     */
    public setActiveTag(id: number|string) {
        this.activeTag = this.getTagById(id);

        //if we failed to set active tag from url,
        // default to tag with name 'open'
        if ( ! this.activeTag) {
            this.activeTag = this.allTags.find(tag => tag.name == 'open');
        }
    }

    /**
     * Return tag matching specified name.
     */
    public getTagByName(name: string): Tag {
        return this.allTags.find(tag => tag.name === name);
    }

    /**
     * Return tag matching specified name.
     */
    public getTagById(id: number|string): Tag {
        if ( ! id) return;
        return this.allTags.find(tag => tag.id == id);
    }

    /**
     * Getter for category tags property.
     */
    public getCategoryTags() {
        return this.categoryTags;
    }

    /**
     * Check if category tags existed.
     */
    public hasCategoryTags() {
        return this.categoryTags.length > 0;
    }

    /**
     * Check if status tags existed.
     */
    public hasStatusTags() {
        return this.statusTags.length > 0;
    }

    /**
     * Getter for status tags property.
     */
    public getStatusTags(excludeMineTag = false, excludeCloseTag = false) {
        let statusTags =this.statusTags;
        if (excludeMineTag) {
            statusTags = statusTags.filter(tag => tag.name !== 'mine');
        }
        if (excludeCloseTag) {
            statusTags = statusTags.filter(tag => tag.name !== 'closed');
        }

        return statusTags;
    }
}
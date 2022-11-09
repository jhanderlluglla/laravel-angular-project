import {Component, OnInit, ViewEncapsulation, EventEmitter, Output, Input} from '@angular/core';
import {TagService} from "../../../shared/tag.service";
import {Tag} from "../../../shared/models/Tag";

@Component({
    selector: 'tags-manager',
    templateUrl: './tags-manager.component.html',
    styleUrls: ['./tags-manager.component.scss'],
    providers: [TagService],
    encapsulation: ViewEncapsulation.None,
})
export class TagsManagerComponent implements OnInit {

    /**
     * Fired when selected tags change.
     */
    @Output() public onChange: EventEmitter<string[]> = new EventEmitter();

    /**
     * Model tags string input field is bound to.
     */
    public tagsString: string;

    /**
     * Currently selected tag names.
     */
    @Input() public selectedTags: string[] = [];

    /**
     * List of all tags from the database.
     */
    public existingTags: Tag[] = [];

    /**
     * Whether tags manager should be readonly
     * or allow adding and removing tags.
     */
    @Input() public readonly = false;

    /**
     * HcTagsManagerComponent Constructor.
     */
    constructor(private tagService: TagService) {}

    ngOnInit() {
        this.tagService.getTags().subscribe(response => {
            this.existingTags = response.data.filter(tag => tag.type !== 'status');
        });
    }

    /**
     * Return copy of selected tags array.
     */
    public getSelectedTags(): string[] {
        return this.selectedTags.slice();
    }

    /**
     * Set selected tags.
     */
    public setSelectedTags(tags: string[]) {
        return this.selectedTags = tags;
    }

    /**
     * Parse given tags string and push resulting tags into tags array.
     */
    public addTags(tags: string) {
        if ( ! tags) return;

        let tagsArray = tags.split(',');

        tagsArray.forEach(name => {
            let tagName = name.trim();

            if (this.selectedTags.indexOf(tagName) === -1) {
                this.selectedTags.push(tagName);
            }
        });

        this.tagsString = '';
        this.onChange.emit(this.selectedTags);
    }

    /**
     * Push given tag name into tags array if it's not in array already.
     */
    public addTag(tagName: string) {
        if (this.selectedTags.indexOf(tagName) === -1) {
            this.selectedTags.push(tagName);
            this.onChange.emit(this.selectedTags);
        }
    }

    /**
     * Remove specified tag from selected tags list.
     */
    public removeTag(tagName: string) {
        let index = this.selectedTags.indexOf(tagName);
        this.selectedTags.splice(index, 1);
        this.onChange.emit(this.selectedTags);
    }

    /**
     * Deselect all tags.
     */
    public deselectAll() {
        this.selectedTags = [];
        this.onChange.emit(this.selectedTags);
    }
}

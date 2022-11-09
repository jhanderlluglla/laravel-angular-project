import {Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TicketsService} from '../tickets.service';
import {TagService} from "../../shared/tag.service";
import {ToastService} from "../../shared/toast/toast.service";
import {Tag} from "../../shared/models/Tag";
import {DropdownComponent} from "../../shared/dropdown/dropdown.component";

@Component({
    selector: 'add-tag-dropdown',
    templateUrl: './add-tag-dropdown.component.html',
    styleUrls: ['./add-tag-dropdown.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AddTagDropdownComponent implements OnInit {
    @ViewChild(DropdownComponent) dropdown: DropdownComponent;

    /**
     * Tags should be added to tickets with matching IDs.
     */
    @Input() ticketIds: number[] = [];

    /**
     * Fired when tag was added to tickets successfully.
     */
    @Output() onTagAdded: EventEmitter<Tag> = new EventEmitter();

    /**
     * Control for tag search input.
     */
    public tagQuery = new FormControl();

    /**
     * List of tags that matched user search query.
     */
    public tags: Tag[];

    /**
     * AddTagDropdownComponent Constructor
     */
    constructor(
        private tickets: TicketsService,
        private tagService: TagService,
        private toast: ToastService,
        public el: ElementRef
    ) {}

    ngOnInit() {
        // this.bindTagQueryInput();
        this.tagService.search('').subscribe(response => this.tags = response.data);
    }

    /**
     * Add tag to specified tickets.
     */
    public addTag(tagName: string) {
        this.tickets.addTag(tagName, this.ticketIds).subscribe(response => {
            this.dropdown.close();
            this.toast.show('Tag added');
            this.onTagAdded.emit(response.data);
        });
    }

    /**
     * Clear tag search field.
     */
    public clearSearchField() {
        if ( ! this.tagQuery.value) return;
        this.tagQuery.setValue(null);
    }

    /**
     * Open the dropdown.
     */
    public open() {
        this.dropdown.open();
    }

    /**
     * Bind tag search input.
     */
    private bindTagQueryInput() {
        this.tagQuery.valueChanges
            .debounceTime(300)
            .distinctUntilChanged()
            .subscribe(query => {
                if ( ! query) return;
                this.tagService.search(query)
                    .subscribe(response => this.tags = response.data);
            });
    }
}

import {Directive, Input, ElementRef, OnChanges} from '@angular/core';
import {Tag} from "../../shared/models/Tag";

@Directive({
    selector: '[highlightOpenTicket]',
})
export class HighlightOpenTicketDirective implements OnChanges {

    @Input('highlightOpenTicket') tags: Tag[];

    constructor(private el: ElementRef) {}

    ngOnChanges(changes) {
        if (changes['tags']['currentValue'] && changes['tags']['currentValue'].find((tag: Tag) => tag.name === 'open')) {
            this.el.nativeElement.classList.add('open');
        } else {
            this.el.nativeElement.classList.remove('open');
        }
    }
}

import {Component, ViewEncapsulation, Input} from "@angular/core";

@Component({
    selector: 'no-results-message',
    templateUrl: './no-results-message.component.html',
    styleUrls: ['./no-results-message.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NoResultsMessageComponent {
    @Input() primaryMessage: string;
    @Input() secondaryMessage: string;
}

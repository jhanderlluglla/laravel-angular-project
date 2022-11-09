import {Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation} from '@angular/core';
import {SettingsService} from "../../../shared/settings.service";

@Component({
    selector: 'articles-order-select',
    templateUrl: './articles-order-select.component.html',
    styleUrls: ['./articles-order-select.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ArticlesOrderSelectComponent implements OnInit {

    /**
     * One way bind to change currently selected value from parent component.
     */
    @Input() selectedValue: string;

    /**
     * Label for select.
     */
    @Input() label: string;

    /**
     * Fired when select value is changed by user from template.
     */
    @Output() onChange = new EventEmitter();

    constructor(private settings: SettingsService) {}

    ngOnInit() {
        if ( ! this.selectedValue) {
            this.selectedValue = this.settings.get('articles.default_order')
        }
    }

    /**
     * Fire onChange event with currently selected orderBy value.
     */
    public fireOnChange(value) {
        this.selectedValue = value;
        this.onChange.emit(value);
    }
}

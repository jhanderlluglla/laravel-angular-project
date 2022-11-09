import {Component, ViewEncapsulation} from "@angular/core";

@Component({
    selector: 'hc-compact-header',
    templateUrl: './hc-compact-header.component.html',
    styleUrls: ['./hc-compact-header.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {'id': 'hc-compact-header'},
})

export class HcCompactHeaderComponent {}

import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from "../../shared/http-client";

@Component({
    selector: 'error-log',
    templateUrl: './error-log.component.html',
    styleUrls: ['./error-log.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ErrorLogComponent implements OnInit {

    /**
     * Number of log items to show.
     */
    @Input() public numberOfItems = 15;

    /**
     * Log of recent app errors.
     */
    public log: any[] = [];

    /**
     * Whether we'ere fetching error log from backend currently.
     */
    public loading = false;

    /**
     * ErrorLogComponent Constructor.
     */
    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loading = true;

        this.http.get('admin/error-log').subscribe((log: Object[]) => {
            this.log = log.slice(0, this.numberOfItems);
            this.loading = false;
        });
    }
}

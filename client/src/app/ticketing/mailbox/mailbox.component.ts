import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MailboxTagsService} from "../mailbox-tags.service";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'mailbox',
    templateUrl: './mailbox.component.html',
    styleUrls: ['./mailbox.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MailboxComponent implements OnInit {

    /**
     * MailboxComponent Constructor.
     */
    constructor(public mailboxTags: MailboxTagsService, private route: ActivatedRoute) { }

    ngOnInit() {
        Observable.merge(
            this.route.firstChild.params,
            this.route.params
        ).subscribe(params => {
            //set active tag based on route params
            if (params['tag_id']) {
                this.mailboxTags.setActiveTag(params['tag_id']);
            }

            //default to 'open' active tag if there are not route params
            if ( ! params['tag_id'] && ! this.mailboxTags.getActiveTagId()) {
                this.mailboxTags.setActiveTag(null);
            }
        });
    }
}
import {Component, ViewChild, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {UploadsService} from "../../shared/uploads.service";
import {TicketsService} from "../tickets.service";
import {HcUrls} from "../../help-center/shared/hc-urls.service";
import {Tag} from "../../shared/models/Tag";
import {User} from "../../shared/models/User";
import {Upload} from "../../shared/models/Upload";
import {SettingsService} from "../../shared/settings.service";
import {ToastService} from "../../shared/toast/toast.service";
import {MailboxTagsService} from "../mailbox-tags.service";

@Component({
    selector: 'new-ticket',
    templateUrl: './new-ticket.component.html',
    styleUrls: ['./new-ticket.component.scss'],
    providers: [TicketsService],
    encapsulation: ViewEncapsulation.None,
    host: {id: 'new-ticket'}
})
export class NewTicketComponent implements OnInit, OnDestroy {
    @ViewChild(TextEditorComponent) textEditor: TextEditorComponent;

    /**
     * New request form errors.
     */
    public errors: Object = {};

    /**
     * All available category tags.
     */
    public ticketCategories: Tag[] = [];

    /**
     * All available category tags.
     */
    public customers: User[] = [];

    /**
     * Files currently attached to this ticket.
     */
    public attachments: Upload[] = [];

    /**
     * New request form model.
     */
    public ticketModel: {category?: Tag, body?: string, subject?: string} = {};

    /**
     * New request form model.
     */
    public customerModel: { isExisting: true, customer: User, body?:string } = {isExisting: true, customer:<User>{}};

    /**
     * Whether ticket is being created currently.
     */
    public isLoading = false;

    /**
     * Create new NewTicketComponent instance
     */
    constructor(
        public settings: SettingsService,
        private tickets: TicketsService,
        private uploads: UploadsService,
        private router: Router,
        private urls: HcUrls,
        private route: ActivatedRoute,
        private toast: ToastService,
        private mailBoxTagsService: MailboxTagsService
    ) {}

    /**
     * Called after angular has initiated component.
     */
    ngOnInit() {
        this.route.data.subscribe(data => {
            this.ticketCategories = data['data']['categories'];
            this.customers = data['data']['customers'];
            this.ticketModel.category = this.ticketCategories[0];
        });
    }

    /**
     * Create a new ticket.
     */
    public createTicket() {
        this.isLoading = true;

        let payload = {
            subject: this.ticketModel.subject,
            body: this.ticketModel.body,
            category: this.ticketModel.category && this.ticketModel.category.id,
            uploads: this.attachments.map(attachment => attachment.file_name)
        };

        if (this.isAgent()) {
            payload['customer'] = {
                id: this.customerModel.customer && this.customerModel.customer.id,
                first_name: this.customerModel.customer && this.customerModel.customer.first_name,
                last_name: this.customerModel.customer && this.customerModel.customer.last_name,
                email: this.customerModel.customer && this.customerModel.customer.email,
                phone_number: this.customerModel.customer && this.customerModel.customer.phone_number,
            };
        }

        this.tickets.create(payload).subscribe(() => {
            this.isLoading = false;
            this.router.navigate(this.urls.getCustomerTicketsListLink());
            this.toast.show('Your request was successfully submitted.');
            this.mailBoxTagsService.refresh();
        }, errors => {
            this.errors = errors.messages;
            this.isLoading = false;
        });
    }

    /**
     * Upload specified files and add them to attachments array.
     */
    public uploadFiles(files: FileList) {
        this.uploads.uploadFiles(files).subscribe(response => {
            this.attachments = this.attachments.concat(response.data);
        }, () => {});
    }

    /**
     * Remove attachment matching given id from the ticket.
     */
    public removeAttachment(id: number) {
        let index = this.attachments.findIndex(attachment => attachment.id == id);
        this.attachments.splice(index, 1);
    }

    /**
     * Check the if user is Agent.
     */
    public isAgent() {
        let categories = this.mailBoxTagsService.getCategoryTags();
        return categories.length > 0;
    }

    ngOnDestroy() {
        this.textEditor.destroyEditor();
    }
}

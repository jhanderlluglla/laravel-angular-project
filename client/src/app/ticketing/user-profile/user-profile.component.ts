import {Component, Injector, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {ActivatedRoute} from "@angular/router";
import {Ticket} from "../../shared/models/Ticket";
import {User} from "../../shared/models/User";
import {UserService} from "../../admin/users/user.service";
import {TagsManagerComponent} from "../../help-center/manage/tags-manager/tags-manager.component";
import {ToastService} from "../../shared/toast/toast.service";
import {ModalService} from "../../shared/modal/modal.service";
import {EmailAddressModalComponent} from "../../user/email-address-modal/email-address-modal.component";
import {Email} from "../../shared/models/Email";
import {FormControl, FormGroup} from "@angular/forms";
import {Paginator} from "../../shared/pagination/paginator.service";
import {UploadsService} from "../../shared/uploads.service";
import {CurrentUser} from "../../auth/current-user";
import {SocialAuthService} from "../../auth/social-auth.service";
import {SettingsService} from "../../shared/settings.service";

@Component({
    selector: 'user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    providers: [UrlAwarePaginator, UserService],
    encapsulation: ViewEncapsulation.None,
})
export class UserProfileComponent implements OnInit {

    /**
     * Tags manager component instance.
     */
    @ViewChild(TagsManagerComponent) tagsManager: TagsManagerComponent;

    /**
     * List of user tickets.
     */
    public tickets: Ticket[];

    /**
     * User model.
     */
    public user = new User();

    /**
     * Form group for user profile.
     */
    public profile = new FormGroup({
        details: new FormControl(),
        notes: new FormControl(),
    });

    /**
     * User tickets paginator instance.
     */
    public paginator: Paginator;

    /**
     * Whether user details should be editable.
     */
    public detailsEditable = false;

    /**
     * UserProfileComponent Constructor.
     */
    constructor(
        private social: SocialAuthService,
        private injector: Injector,
        private users: UserService,
        private route: ActivatedRoute,
        private toast: ToastService,
        private modal: ModalService,
        private uploads: UploadsService,
        public currentUser: CurrentUser,
        public settings: SettingsService,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.hydrateProfile(data['resolves']['user']);
            this.bindFormControls();
            this.createTicketsPaginator(data);
        });

        this.detailsEditable = this.currentUser.hasPermission('users.update');
    }

    /**
     * Open add email modal and attach email supplied by user.
     */
    public openAddEmailModal() {
        this.modal.show(EmailAddressModalComponent, {userId: this.user.id}).onDone.subscribe(email => {
            this.user.secondary_emails.push(new Email({address: email}));
        });
    }

    /**
     * Remove specified secondary email from user.
     */
    public removeEmail(emailAddress: string) {
        this.users.removeEmail(this.user.id, {emails: [emailAddress]}).subscribe(() => {
            let index = this.user.secondary_emails.findIndex(email => email.address === emailAddress);
            this.user.secondary_emails.splice(index, 1);
        });
    }

    /**
     * Open file upload dialog and upload selected file as user avatar.
     */
    public openAvatarUploadDialog() {
        this.uploads.openUploadDialog().then(files => {
            if (this.uploads.filesAreInvalid(files, true)) return;

            this.users.uploadAvatar(this.user.id, files).subscribe(user => {
                this.user.avatar = user.avatar;
                this.toast.show('Avatar updated.');
            });
        });
    }

    /**
     * Delete user avatar.
     */
    public deleteAvatar() {
        this.users.deleteAvatar(this.user.id).subscribe(user => {
            this.user.avatar = user.avatar;
            this.toast.show('Avatar removed.');
        });
    }

    /**
     * Update User
     */
    public updateUser() {
        this.users.update(this.user.id, this.user).subscribe(user => {
            this.user = user;
            this.toast.show('User Updated.');
        })
    }

    /**
     * Sync user tags using specified ones.
     */
    public syncUserTags(tags: string[]) {
        this.users.syncTags(this.user.id, {tags}).subscribe();
    }

    /**
     * Hydrate profile models using specified user.
     */
    private hydrateProfile(user: User) {
        this.user = user;
        this.tagsManager.selectedTags = user.tags.map(tag => tag.name);

        if ( ! user.details) return;

        this.profile.setValue({
            details: user.details.details,
            notes: user.details.notes
        });
    }

    /**
     * Create user tickets paginator from specified data.
     */
    private createTicketsPaginator(data) {
        this.paginator = new Paginator(this.injector);
        this.paginator.serverUri = 'tickets';
        this.paginator.staticQueryParams['user_id'] = data['resolves']['user']['id'];
        this.paginator.setParams(data['resolves']['tickets']);
        this.paginator.data = data['resolves']['tickets']['data'];
    }

    /**
     * Save user profile details on model changes.
     */
    private bindFormControls() {
        this.profile.valueChanges
            .debounceTime(600)
            .distinctUntilChanged()
            .subscribe(payload => {
                this.users.updateDetails(this.user.id, payload).subscribe(() => {
                    this.toast.show('Updated user details.');
                });
            });
    }

    /**
     * Connect specified social account to user.
     */
    public connectSocialAccount(name: string) {
        this.social.connect(name).then(user => {
            this.user.social_profiles = user.social_profiles;
            this.toast.show('Connected: '+name);
        });
    }

    /**
     * Disconnect specified social account from user.
     */
    public disconnectSocialAccount(name: string) {
        this.social.disconnect(name).subscribe(() => {
            this.toast.show('Disconnected: '+name);
            let i = this.user.social_profiles.findIndex(s => s.service_name === name);
            this.user.social_profiles.splice(i, 1);
        });
    }

    /**
     * Get username from specified social account model.
     */
    public getSocialAccountUsername(name: string): string {
        if ( ! this.user.social_profiles) return;

        let account = this.user.social_profiles
            .find(social => social.service_name === name);

        return account && account.username;
    }
}

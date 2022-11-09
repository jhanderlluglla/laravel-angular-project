import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {User} from "../../shared/models/User";
import {SettingsService} from "../../shared/settings.service";
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../admin/users/user.service";
import {ToastService} from "../../shared/toast/toast.service";
import {UploadsService} from "../../shared/uploads.service";
import {ErrorsModel, PasswordModel} from "./account-settings-types";
import {Translations} from "../../shared/translations/translations.service";

@Component({
    selector: 'account-settings',
    templateUrl: './account-settings.component.html',
    styleUrls: ['./account-settings.component.scss'],
    providers: [UploadsService],
    encapsulation: ViewEncapsulation.None,
})
export class AccountSettingsComponent implements OnInit {

    /**
     * User model.
     */
    public user = new User();

    /**
     * Value lists for selects in the view.
     */
    public selects = {
        timezones: [],
        countries: [],
        languages: [],
    };

    /**
     * Model for user password change.
     */
    public password: PasswordModel = {};

    /**
     * Errors returned from backend.
     */
    public errors: ErrorsModel = {password: {}, account: {}};

    /**
     * AccountSettingsComponent Constructor.
     */
    constructor(
        public settings: SettingsService,
        private route: ActivatedRoute,
        private users: UserService,
        private toast: ToastService,
        private uploads: UploadsService,
        private i18n: Translations
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.user = data['resolves']['user'];
            this.selects.timezones = data['resolves']['selects']['timezones'];
            this.selects.countries = data['resolves']['selects']['countries'];
            this.selects.languages = data['resolves']['selects']['languages'];
        });
    }

    /**
     * Update user account settings.
     */
    public updateAccountSettings() {
        this.users.update(this.user.id, this.getAccountSettingsPayload()).subscribe(() => {
            this.toast.show('Account settings updated');
            this.errors.account = {};
        }, response => this.errors.account = response.messages);
    }

    /**
     * Open file upload dialog and upload selected file as user avatar.
     */
    public openAvatarUploadDialog() {
        this.uploads.openUploadDialog().then(files => {
            if (this.uploads.filesAreInvalid(files, true)) return;

            this.users.uploadAvatar(this.user.id, files).subscribe(user => {
                this.user.avatar = user.avatar;
                this.toast.show('Avatar updated');
            });
        });
    }

    /**
     * Delete user avatar.
     */
    public deleteAvatar() {
        this.users.deleteAvatar(this.user.id).subscribe(user => {
            this.user.avatar = user.avatar;
            this.toast.show('Avatar removed');
        });
    }

    /**
     * Change user password.
     */
    public changeUserPassword() {
        this.users.changePassword(this.user.id, this.password)
        .subscribe(() => {
            this.toast.show('Password updated');
            this.errors.password = {};
            this.password = {};
            this.user.has_password = true;
        }, response => this.errors.password = response.messages);
    }

    /**
     * Change currently active language.
     */
    public changeLanguage(name: string) {
        this.i18n.setLocalizationByName(name);
    }

    /**
     * Return payload to send to backend when updating account settings.
     */
    private getAccountSettingsPayload() {
        return {
            first_name: this.user.first_name,
            last_name: this.user.last_name,
            language: this.user.language,
            timezone: this.user.timezone,
            country: this.user.country,
            avatar: this.user.avatar,
        };
    }
}

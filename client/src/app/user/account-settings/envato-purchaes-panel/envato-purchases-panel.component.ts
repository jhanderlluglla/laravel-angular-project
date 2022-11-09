import {Component, Input, ViewEncapsulation} from '@angular/core';
import {User} from "../../../shared/models/User";
import {SocialAuthService} from "../../../auth/social-auth.service";
import {ToastService} from "../../../shared/toast/toast.service";

@Component({
    selector: 'envato-purchases-panel',
    templateUrl: './envato-purchases-panel.component.html',
    styleUrls: ['./envato-purchases-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class EnvatoPurchasesPanelComponent {

    /**
     * User model.
     */
    @Input() public user = new User();

    /**
     * EnvatoPurchasesPanelComponent Constructor.
     */
    constructor(
        private social: SocialAuthService,
        private toast: ToastService,
    ) {}

    /**
     * Connect specified social account to user.
     */
    public updatePurchases() {
        this.social.connect('envato').then(user => {
            this.user.social_profiles = user.social_profiles;
            this.user.purchase_codes = user.purchase_codes;
            this.toast.show('Updated envato purchases.');
        });
    }
}
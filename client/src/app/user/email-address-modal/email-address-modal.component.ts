import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {BaseModalClass} from "../../shared/modal/base-modal";
import {UserService} from "../../admin/users/user.service";

@Component({
    selector: 'email-address-modal',
    templateUrl: './email-address-modal.component.html',
    styleUrls: ['./email-address-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class EmailAddressModalComponent extends BaseModalClass {

    /**
     * Email address model.
     */
    public emailAddress: string;

    /**
     * Id of user email address should be attached to.
     */
    private userId: number;

    /**
     * EmailAddressModalComponent Constructor.
     */
    constructor(
        protected el: ElementRef,
        protected renderer: Renderer2,
        protected users: UserService
    ) {
        super(el, renderer);
    }

    /**
     * Show the modal.
     */
    public show(params: {userId: number}) {
        this.userId = params.userId;
        super.show(params);
    }

    /**
     * Return email user has entered to caller.
     */
    public confirm() {
        this.users.addEmail(this.userId, {emails: [this.emailAddress]}).subscribe(() => {
            super.done(this.emailAddress);
        }, super.handleErrors.bind(this));
    }
}

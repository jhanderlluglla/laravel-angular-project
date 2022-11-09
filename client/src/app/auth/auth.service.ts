import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from "../shared/http-client";
import {CurrentUser} from "./current-user";
import {Router, ActivatedRoute} from '@angular/router';
import {ToastService} from "../shared/toast/toast.service";
import {ModalService} from "../shared/modal/modal.service";
import {Observable} from "rxjs";
import {User} from "../shared/models/User";

@Injectable()
export class AuthService {

    /**
     * Frontend route customers should be redirected to after successful login.
     */
    protected redirectUri = '/help-center';

    /**
     * Frontend route agents should be redirected to after successful login.
     */
    protected agentRedirectUri = '/mailbox';

    /**
     * AuthService Constructor.
     */
    constructor (
        protected httpClient: HttpClient,
        protected currentUser: CurrentUser,
        protected router: Router,
        protected route: ActivatedRoute,
        protected toast: ToastService,
        protected zone: NgZone,
        protected modal: ModalService,
    ) {}

    /**
     * Log user in with specified credentials.
     */
    public login(credentials: Object) {
        return this.httpClient.post('auth/login', credentials);
    }

    /**
     * Register a new user.
     */
    public register(credentials: Object): Observable<{data: User}> {
        return this.httpClient.post('auth/register', credentials);
    }

    /**
     * Log current user out.
     */
    public logOut() {
        this.httpClient.post('auth/logout').subscribe(() => {
            this.currentUser.clear();
            this.router.navigate(['/login']);
        });
    }

    /**
     * Send password reset link to user via email.
     */
    public sendPasswordResetLink(credentials: Object) {
        return this.httpClient.post('auth/password/email', credentials);
    }

    /**
     * Reset user password.
     */
    public resetPassword(credentials: Object) {
        return this.httpClient.post('auth/password/reset', credentials);
    }

    /**
     * Get URI user should be redirect to after login.
     */
    public getRedirectUri(): string {
        if (this.currentUser.redirectUri) {
            let uri = this.currentUser.redirectUri;
            this.currentUser.redirectUri = null;
            return uri;
        } else if (this.currentUser.hasPermission('tickets.view')) {
            return this.agentRedirectUri;
        } else {
            return this.redirectUri;
        }
    }
}

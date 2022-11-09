import {NgModule}           from '@angular/core';
import {CommonModule}       from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from "../shared.module";
import {routing} from "./auth.routing";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {ResetPasswordComponent} from "./reset-password/reset-password.component";
import {AuthService} from "./auth.service";
import {SocialAuthService} from "./social-auth.service";
import {ForgotPasswordComponent} from "./forgot-password/forgot-password.component";
import {RequestExtraCredentialsModalComponent} from "./request-extra-credentials-modal/request-extra-credentials-modal.component";
import {ModalService} from "../shared/modal/modal.service";

@NgModule({
    imports:      [CommonModule, FormsModule, RouterModule, SharedModule, routing],
    declarations: [
        LoginComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        RequestExtraCredentialsModalComponent,
    ],
    entryComponents: [
        RequestExtraCredentialsModalComponent,
    ],
    exports:      [],
    providers:    [AuthService, SocialAuthService, ModalService]
})
export class AuthModule { }
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared.module";
import {UserAccessManagerComponent} from "./user-access-manager/user-access-manager.component";
import {CommonModule} from "@angular/common";
import {GroupService} from "../admin/groups/group.service";
import {UserService} from "../admin/users/user.service";
import {SelectGroupsModalComponent} from "./select-groups-modal/select-groups-modal.component";
import { SelectPermissionsModalComponent } from './select-permissions-modal/select-permissions-modal.component';
import {TagsManagerComponent} from "../help-center/manage/tags-manager/tags-manager.component";
import {EmailAddressModalComponent} from './email-address-modal/email-address-modal.component';
import {AccountSettingsComponent} from './account-settings/account-settings.component';
import {ModalService} from "../shared/modal/modal.service";
import {AccountSettingsResolve} from "./account-settings/account-settings-resolve.service";
import {ConnectSocialAccountsPanelComponent} from "./account-settings/connect-social-accounts-panel/connect-social-accounts-panel.component";
import {EnvatoPurchasesPanelComponent} from "./account-settings/envato-purchaes-panel/envato-purchases-panel.component";

@NgModule({
    declarations: [
        UserAccessManagerComponent,
        SelectGroupsModalComponent,
        SelectPermissionsModalComponent,
        TagsManagerComponent,
        EmailAddressModalComponent,
        AccountSettingsComponent,
        ConnectSocialAccountsPanelComponent,
        EnvatoPurchasesPanelComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    exports: [
        UserAccessManagerComponent,
        TagsManagerComponent,
        ConnectSocialAccountsPanelComponent,
        EnvatoPurchasesPanelComponent,
    ],
    entryComponents: [
        SelectGroupsModalComponent,
        SelectPermissionsModalComponent,
        EmailAddressModalComponent,
    ],
    providers: [GroupService, UserService, ModalService, AccountSettingsResolve]
})
export class UserModule {}
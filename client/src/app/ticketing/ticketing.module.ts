import {NgModule}           from '@angular/core';
import {CommonModule}       from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from "../shared.module";
import {routing} from "./ticketing.routing";
import {MailboxComponent} from "./mailbox/mailbox.component";
import {TicketFloatingToolbarComponent} from "./ticket-floating-toolbar/ticket-floating-toolbar.component";
import {TicketsListComponent} from "./tickets-list/tickets-list.component";
import {TicketSearchDropdownComponent} from "../shared/ticket-search-dropdown/ticket-search-dropdown.component";
import {AgentNavbarComponent} from "../shared/agent-navbar/agent-navbar.component";
import {AgentSearchModalComponent} from "./agent-search-modal/agent-search-modal.component";
import {TicketsService} from "./tickets.service";
import {ConversationModule} from "../conversation/conversation.module";
import {ModalService} from "../shared/modal/modal.service";
import {UserProfileComponent} from './user-profile/user-profile.component';
import {UserProfileResolve} from "./user-profile/user-profile-resolve.service";
import {UserModule} from "../user/user.module";
import {GroupService} from "../admin/groups/group.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        UserModule,
        ConversationModule,
        routing
    ],
    declarations: [
        MailboxComponent,
        TicketFloatingToolbarComponent,

        TicketsListComponent,
        TicketSearchDropdownComponent,
        AgentNavbarComponent,
        AgentSearchModalComponent,
        UserProfileComponent,
    ],
    entryComponents: [
        AgentSearchModalComponent,
    ],
    providers: [
        TicketsService,
        ModalService,
        UserProfileResolve,
        GroupService
    ],
    exports: [
        TicketsListComponent
    ]
})
export class TicketingModule { }
import {RouterModule} from '@angular/router';
import {MailboxComponent} from "./mailbox/mailbox.component";
import {TicketsListComponent} from "./tickets-list/tickets-list.component";
import {AuthGuard} from "../guards/auth-guard.service";
import {ConversationComponent} from "../conversation/conversation.component";
import {TicketResolve} from "../conversation/conversation-resolve.service";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {UserProfileResolve} from "./user-profile/user-profile-resolve.service";

export const routing = RouterModule.forChild([
    {path: '', canActivateChild: [AuthGuard], children: [
        {
            path: '',
            redirectTo: 'tickets',
            pathMatch: 'full',
        },
        {
            path: 'tickets',
            component: MailboxComponent,
            data: {permissions: ['tickets.view']},
            children: [
                {path: '', component: TicketsListComponent},
            ]
        },
        {
            path: 'tickets/tag/:tag_id',
            component: MailboxComponent,
            data: {permissions: ['tickets.view']},
            children: [
                {path: '', component: TicketsListComponent},
                {path: 'ticket/:ticket_id', component: ConversationComponent, resolve: {ticket: TicketResolve}},
            ]
        },
        {
            path: 'users/:id',
            component: UserProfileComponent,
            resolve: {resolves: UserProfileResolve},
            data: {permissions: ['users.view', 'tickets.view', 'tags.view']},
        }
    ]}
]);
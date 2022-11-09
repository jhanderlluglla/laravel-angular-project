import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {CustomerTicketsListComponent} from "./customer-tickets-list/customer-tickets-list.component";
import {routing} from "./customer-mailbox.routing";
import {SharedModule} from "../shared.module";
import {CustomerMailboxComponent} from "./customer-mailbox.component";
import {NewTicketComponent} from "../ticketing/new-ticket/new-ticket.component";
import {SuggestedArticlesDrawerComponent} from "../ticketing/suggested-articles-drawer/suggested-articles-drawer.component";
import {TextEditorModule} from "../text-editor/text-editor.module";
import {Conversation} from "../conversation/conversation.service";
import {CustomerConversationComponent} from "./customer-conversation/customer-conversation.component";
import {ModalService} from "../shared/modal/modal.service";
import {HelpCenterSharedModule} from "../help-center/shared/help-center-shared.module";
import {TicketResolve} from "../conversation/conversation-resolve.service";
import {ConversationModule} from "../conversation/conversation.module";
import {NewTicketCategoriesResolve} from "./new-ticket-categories-resolve";

@NgModule({
    imports:      [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ConversationModule,
        HelpCenterSharedModule,
        TextEditorModule,
        routing
    ],
    declarations: [
        CustomerMailboxComponent,
        CustomerTicketsListComponent,
        NewTicketComponent,
        SuggestedArticlesDrawerComponent,
        CustomerConversationComponent,
    ],
    exports: [NewTicketComponent],
    providers: [Conversation, TicketResolve, NewTicketCategoriesResolve, ModalService]
})
export class CustomerMailboxModule { }
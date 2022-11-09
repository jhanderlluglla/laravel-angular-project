import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../shared.module";
import {ConversationToolbarComponent} from "./conversation-toolbar/conversation-toolbar.component";
import {ConversationHeaderComponent} from "./conversation-header/conversation-header.component";
import {ConversationRepliesComponent} from "./conversation-replies/conversation-replies.component";
import {ConversationTextEditorComponent} from "./conversation-text-editor/conversation-text-editor.component";
import {ConversationSidebarComponent} from "./conversation-sidebar/conversation-sidebar.component";
import {AddNoteModalComponent} from "../ticketing/add-note-modal/add-note-modal.component";
import {ConversationModalComponent} from "./conversation-modal/conversation-modal.component";
import {ConversationComponent} from "./conversation.component";
import {UpdateReplyModalComponent} from "../ticketing/update-reply-modal/update-reply-modal.component";
import {CannedRepliesDropdownComponent} from "../ticketing/canned-replies/dropdown/canned-replies-dropdown.component";
import {ConfirmReplyDeleteModalComponent} from "./confirm-reply-delete-modal/confirm-reply-delete-modal.component";
import {AttachmentsListComponent} from "../shared/attachments-list/attachments-list.component";
import {ShowOriginalReplyModalComponent} from "./conversation-replies/show-original-reply-modal/show-original-reply-modal.component";
import {CannedRepliesService} from "../ticketing/canned-replies/canned-replies.service";
import {Conversation} from "./conversation.service";
import {TicketResolve} from "./conversation-resolve.service";
import {AssignTicketDropdownComponent} from "../ticketing/assign-ticket-dropdown/assign-ticket-dropdown.component";
import {AssignPriorityTicketDropdownComponent} from "../ticketing/assign-priority-ticket-dropdown/assign-priority-ticket-dropdown.component";
import {AddTagDropdownComponent} from "../ticketing/add-tag-dropdown/add-tag-dropdown.component";
import {HighlightOpenTicketDirective} from "../ticketing/tickets-list/highlight-open-ticket-directive";
import {TextEditorModule} from "../text-editor/text-editor.module";
import {TicketsService} from "../ticketing/tickets.service";
import {UploadsService} from "../shared/uploads.service";
import {FilePreviewModule} from "../shared/file-preview/file-preview.module";
import {TagService} from "../shared/tag.service";
import {CrupdateCannedReplyModalComponent} from "../ticketing/canned-replies/crupdate-canned-reply-modal/crupdate-canned-reply-modal.component";
import {Draft} from "./draft.service";
import {ConversationReplies} from "./conversation-replies.service";
import {AfterReplyAction} from "./after-reply-action.service";
import {TicketAttachmentsService} from "../ticketing/ticket-attachments.service";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TextEditorModule, FilePreviewModule, SharedModule],
    declarations: [
        ConversationToolbarComponent,
        ConversationHeaderComponent,
        ConversationRepliesComponent,
        ConversationTextEditorComponent,
        ConversationSidebarComponent,
        AddNoteModalComponent,
        ConversationModalComponent,
        ConversationComponent,
        UpdateReplyModalComponent,
        CrupdateCannedReplyModalComponent,
        CannedRepliesDropdownComponent,
        ConfirmReplyDeleteModalComponent,
        AttachmentsListComponent,
        ShowOriginalReplyModalComponent,
        AssignTicketDropdownComponent,
        AssignPriorityTicketDropdownComponent,
        AddTagDropdownComponent,
        HighlightOpenTicketDirective,
    ],
    entryComponents: [
        CrupdateCannedReplyModalComponent,
        ConfirmReplyDeleteModalComponent,
        AddNoteModalComponent,
        ConversationModalComponent,
        UpdateReplyModalComponent,
        ShowOriginalReplyModalComponent,
    ],
    exports: [
        AttachmentsListComponent,
        ConversationHeaderComponent,
        ConversationTextEditorComponent,
        ConversationRepliesComponent,
        HighlightOpenTicketDirective,
        AddTagDropdownComponent,
        AssignTicketDropdownComponent,
        AssignPriorityTicketDropdownComponent,
        AddNoteModalComponent,
    ],
    providers: [
        CannedRepliesService,
        Conversation,
        ConversationReplies,
        TicketsService,
        TicketAttachmentsService,
        TicketResolve,
        UploadsService,
        TagService,
        Draft,
        AfterReplyAction,
    ]
})
export class ConversationModule { }
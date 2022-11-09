import {NgModule}           from '@angular/core';
import {CommonModule}       from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {AssignUsersToGroupModalComponent} from "./groups/assign-users-to-group-modal/assign-users-to-group-modal.component";
import {CrupdateGroupModalComponent} from "./groups/crupdate-group-modal/crupdate-group-modal.component";
import {UserService} from "./users/user.service";
import {GroupService} from "./groups/group.service";
import {SharedModule} from "../shared.module";
import {DatepickerComponent} from "../shared/datepicker/datepicker.component";
import {UsersComponent} from "./users/users.component";
import {AdminRoutingModule} from "./admin-routing.module";
import {AdminComponent} from "./admin.component";
import {CrupdateUserModalComponent} from "./users/crupdate-user-modal/crupdate-user-modal.component";
import {SettingsComponent} from "./settings/settings.component";
import {TagsComponent} from "./tags/tags.component";
import {GroupsComponent} from "./groups/groups.component";
import {ReportsComponent} from "./reports/reports.component";
import {EnvatoReportsComponent} from "./reports/envato-reports/envato-reports.component";
import {TicketsReportComponent} from "./reports/tickets-report/tickets-report.component";
import {CrupdateTagModalComponent} from "./tags/crupdate-tag-modal/crupdate-tag-modal.component";
import {EarningsChartComponent} from "./reports/envato-reports/earnings-chart/earnings-chart.component";
import {PercentageChangeComponent} from "./reports/percentage-change/percentage-change.component";
import {YearlyEarningsChartComponent} from "./reports/envato-reports/yearly-earnings-chart/yearly-earnings-chart.component";
import {EarningsVsTicketsChartComponent} from "./reports/envato-reports/earnings-vs-tickets-chart/earnings-vs-tickets-chart.component";
import {TicketsCountChartComponent} from "./reports/tickets-report/tickets-count-chart/tickets-count-chart";
import {TicketsByTagsChartComponent} from "./reports/tickets-report/tickets-by-tags-chart/tickets-by-tag-chart";
import {FirstResponseByHoursChartComponent} from "./reports/tickets-report/first-response-by-hours-chart/first-response-by-hours-chart";
import {TicketsByHourChartComponent} from "./reports/tickets-report/tickets-by-hour-chart/tickets-by-hour-chart.component";
import {ModalService} from "../shared/modal/modal.service";
import {UserModule} from "../user/user.module";
import {AuthenticationSettingsComponent} from "./settings/authentication/authentication-settings.component";
import {CacheSettingsComponent} from "./settings/cache/cache-settings.component";
import {EnvatoSettingsComponent} from "./settings/envato/envato-settings.component";
import {HelpCenterSettingsComponent} from "./settings/help-center/help-center-settings.component";
import {PermissionsSettingsComponent} from "./settings/permissions/permissions-settings.component";
import {RealtimeSettingsComponent} from "./settings/realtime/realtime-settings.component";
import {TicketingSettingsComponent} from "./settings/ticketing/ticketing-settings.component";
import {SettingsPanelComponent} from "./settings/settings-panel.component";
import {ErrorLogComponent} from './error-log/error-log.component';
import {PagesComponent} from './pages/pages.component';
import {CrupdatePageComponent} from './pages/crupdate-page/crupdate-page.component';
import {TextEditorModule} from "../text-editor/text-editor.module";
import {TriggerComponent} from "./triggers/triggers.component";
import {ConditionsComponent} from "./triggers/conditions/conditions.component";
import {TriggersService} from "./triggers/triggers.service";
import {TriggerResolve} from "./triggers/trigger-resolve.service";
import {CrupdateTriggerComponent} from "./triggers/crupdate-trigger/crupdate-trigger.component";
import {TranslationsComponent} from './translations/translations.component';
import {LocalizationSettingsComponent} from "./settings/localization/localization-settings.component";
import {CrupdateLocalizationModalComponent} from "./translations/crupdate-localization-modal/crupdate-localization-modal.component";
import {LocalizationsResolve} from "./translations/localizations-resolve.service";
import {MailTemplatesComponent} from './mail-templates/mail-templates.component';
import {MailTemplatePreviewComponent} from './mail-templates/mail-template-preview/mail-template-preview.component';
import {CannedRepliesComponent} from './canned-replies/canned-replies.component';
import {MailTemplatesResolve} from "./mail-templates/mail-templates-resolve.service";
import {ConversationModule} from "../conversation/conversation.module";
import {MailSettingsComponent} from "./settings/mail/mail-settings.component";
import {SettingsResolve} from "./settings/settings-resolve.service";
import {SettingsState} from "./settings/settings-state.service";
import {LoggingSettingsComponent} from "./settings/logging/logging-settings.component";
import {SearchSettingsComponent} from "./settings/search/search-settings.component";
import {QueueSettingsComponent} from "./settings/queue/queue-settings.component";
import {TicketsService} from "../ticketing/tickets.service";
import {TicketsResolve} from "./tickets/tickets-resolve.service";
import {TicketsComponent} from "./tickets/tickets.component";
import {TicketingModule} from "../ticketing/ticketing.module";
import {CustomerMailboxModule} from "../customer-mailbox/customer-mailbox.module";
import {MailboxTagsService} from "../ticketing/mailbox-tags.service";

import {SupervisorsComponent} from "./supervisors/supervisors.component";
import {CrupdateSupervisorModalComponent} from "./supervisors/crupdate-supervisor-modal/crupdate-supervisor-modal.component";
import {SupervisorsService} from "./supervisors/supervisors.service";
import {StagesComponent} from "./stages/stages.component";
import {CrupdateStageModalComponent} from "./stages/crupdate-stage-modal/crupdate-stage-modal.component";
import {StagesService} from "./stages/stages.service";

import {EscalationRulesComponent} from "./escalation-rules/escalation-rules.component";
import {CrupdateEscalationRuleModalComponent} from "./escalation-rules/crupdate-escalation-rule-modal/crupdate-escalation-rule-modal.component";
import {EscalationRulesService} from "./escalation-rules/escalation-rules.service";

import {PrioritiesComponent} from "./priorities/priorities.component";
import {CrupdatePriorityModalComponent} from "./priorities/crupdate-priority-modal/crupdate-priority-modal.component";
import {PrioritiesService} from "./priorities/priorities.service";


@NgModule({
    imports:      [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        UserModule,
        TextEditorModule,
        AdminRoutingModule,
        ConversationModule,
        TicketingModule,
        CustomerMailboxModule,
    ],
    declarations: [
        AdminComponent,
        ErrorLogComponent,
        TagsComponent,
        GroupsComponent,
        CrupdateGroupModalComponent,
        AssignUsersToGroupModalComponent,
        DatepickerComponent,
        UsersComponent,
        CrupdateUserModalComponent,
        CrupdateTagModalComponent,
        TranslationsComponent,
        CrupdateLocalizationModalComponent,
        PagesComponent,
        CrupdatePageComponent,
        MailTemplatesComponent,
        MailTemplatePreviewComponent,
        CannedRepliesComponent,

        //triggers
        TriggerComponent,
        CrupdateTriggerComponent,
        ConditionsComponent,

        //reports
        ReportsComponent,
        EnvatoReportsComponent,
        TicketsReportComponent,
        EarningsChartComponent,
        PercentageChangeComponent,
        EarningsVsTicketsChartComponent,
        YearlyEarningsChartComponent,
        TicketsCountChartComponent,
        TicketsByTagsChartComponent,
        FirstResponseByHoursChartComponent,
        TicketsByHourChartComponent,

        //settings
        SettingsComponent,
        SettingsPanelComponent,
        AuthenticationSettingsComponent,
        CacheSettingsComponent,
        EnvatoSettingsComponent,
        HelpCenterSettingsComponent,
        PermissionsSettingsComponent,
        RealtimeSettingsComponent,
        TicketingSettingsComponent,
        LocalizationSettingsComponent,
        MailSettingsComponent,
        LoggingSettingsComponent,
        SearchSettingsComponent,
        QueueSettingsComponent,

        //tickets
        TicketsComponent,

        //Supervisors
        SupervisorsComponent,
        CrupdateSupervisorModalComponent,

        //Stages
        StagesComponent,
        CrupdateStageModalComponent,

        //EscalationRules
        EscalationRulesComponent,
        CrupdateEscalationRuleModalComponent,

        //Priorities
        PrioritiesComponent,
        CrupdatePriorityModalComponent,
    ],
    entryComponents: [
        CrupdateTagModalComponent,
        CrupdateUserModalComponent,
        CrupdateGroupModalComponent,
        AssignUsersToGroupModalComponent,
        CrupdateSupervisorModalComponent,
        CrupdateStageModalComponent,
        CrupdateEscalationRuleModalComponent,
        CrupdatePriorityModalComponent,
        
    ],
    exports:      [],
    providers:    [
        GroupService,
        UserService,
        TriggersService,
        TriggerResolve,
        TicketsResolve,
        TicketsService,
        LocalizationsResolve,
        MailTemplatesResolve,
        SettingsResolve,
        SettingsState,
        ModalService,
        TicketsService,
        MailboxTagsService,
        SupervisorsService,
        StagesService,
        PrioritiesService,
        EscalationRulesService,
    ]
})
export class AdminModule { }
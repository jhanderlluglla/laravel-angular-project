import {RouterModule, Routes} from '@angular/router';
import {TicketsReportComponent} from "./reports/tickets-report/tickets-report.component";
import {EnvatoReportsComponent} from "./reports/envato-reports/envato-reports.component";
import {ReportsComponent} from "./reports/reports.component";
import {GroupsComponent} from "./groups/groups.component";
import {TagsComponent} from "./tags/tags.component";
import {SettingsComponent} from "./settings/settings.component";
import {UsersComponent} from "./users/users.component";
import {AdminComponent} from "./admin.component";
import {AuthGuard} from "../guards/auth-guard.service";
import {AuthenticationSettingsComponent} from "./settings/authentication/authentication-settings.component";
import {EnvatoSettingsComponent} from "./settings/envato/envato-settings.component";
import {CacheSettingsComponent} from "./settings/cache/cache-settings.component";
import {HelpCenterSettingsComponent} from "./settings/help-center/help-center-settings.component";
import {PermissionsSettingsComponent} from "./settings/permissions/permissions-settings.component";
import {TicketingSettingsComponent} from "./settings/ticketing/ticketing-settings.component";
import {RealtimeSettingsComponent} from "./settings/realtime/realtime-settings.component";
import {NgModule} from "@angular/core";
import {PagesComponent} from "./pages/pages.component";
import {CrupdatePageComponent} from "./pages/crupdate-page/crupdate-page.component";
import {TriggerComponent} from "./triggers/triggers.component";
import {CrupdateTriggerComponent} from "./triggers/crupdate-trigger/crupdate-trigger.component";
import {TriggerResolve} from "./triggers/trigger-resolve.service";
import {TranslationsComponent} from "./translations/translations.component";
import {LocalizationSettingsComponent} from "./settings/localization/localization-settings.component";
import {LocalizationsResolve} from "./translations/localizations-resolve.service";
import {MailTemplatesComponent} from "./mail-templates/mail-templates.component";
import {CannedRepliesComponent} from "./canned-replies/canned-replies.component";
import {MailTemplatesResolve} from "./mail-templates/mail-templates-resolve.service";
import {MailSettingsComponent} from "./settings/mail/mail-settings.component";
import {SettingsResolve} from "./settings/settings-resolve.service";
import {LoggingSettingsComponent} from "./settings/logging/logging-settings.component";
import {SearchSettingsComponent} from "./settings/search/search-settings.component";
import {QueueSettingsComponent} from "./settings/queue/queue-settings.component";
import {TicketsListComponent} from "../ticketing/tickets-list/tickets-list.component";
import {ConversationComponent} from "../conversation/conversation.component";
import {NewTicketComponent} from "../ticketing/new-ticket/new-ticket.component";
import {TicketsComponent} from "./tickets/tickets.component";
import {TicketsResolve} from "./tickets/tickets-resolve.service";
import {TicketResolve} from "../conversation/conversation-resolve.service";
import {NewTicketCategoriesResolve} from "../customer-mailbox/new-ticket-categories-resolve";

import {SupervisorsComponent} from "./supervisors/supervisors.component";
import {StagesComponent} from './stages/stages.component';
import {PrioritiesComponent} from './priorities/priorities.component';

import {EscalationRulesComponent} from './escalation-rules/escalation-rules.component';

const routes: Routes = [
    {path: '', component: AdminComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard], data: {permissions: ['access.admin']}, children: [
        {
            path: '',
            redirectTo: 'reports'
        },
        {
            path: 'users',
            component: UsersComponent, data: {permissions: ['users.view']}
        },
        {
            path: 'tags',
            component: TagsComponent, data: {permissions: ['tags.view']}
        },
        {
            path: 'supervisors',
            component: SupervisorsComponent,
        },
        {
            path: 'stages',
            component: StagesComponent,
        },
        {
            path: 'priorities',
            component: PrioritiesComponent,
        },
        {
            path: 'escalation-rules',
            component: EscalationRulesComponent,
        },
        {
            path: 'canned-replies',
            component: CannedRepliesComponent,
            data: {permissions: ['canned_replies.view']}
        },
        {
            path: 'triggers',
            component: TriggerComponent,
            data: {permissions: ['triggers.view']}
        },
        {
            path: 'triggers/new',
            component: CrupdateTriggerComponent,
            data: {permissions: ['triggers.create']}
        },
        {
            path: 'triggers/:id/edit',
            component: CrupdateTriggerComponent,
            resolve: {trigger: TriggerResolve},
            data: {permissions: ['triggers.update']}
        },
        {
            path: 'groups',
            component: GroupsComponent,
            data: {permissions: ['groups.view']}
        },
        {
            path: 'translations',
            component: TranslationsComponent,
            resolve: {localizations: LocalizationsResolve},
            data: {permissions: ['localizations.view']}
        },
        {
            path: 'mail-templates',
            component: MailTemplatesComponent,
            resolve: {templates: MailTemplatesResolve},
            data: {permissions: ['mail_templates.view']}
        },
        {
            path: 'pages',
            component: PagesComponent,
            data: {permissions: ['pages.view']}},
        {
            path: 'pages/new',
            component: CrupdatePageComponent,
            data: {permissions: ['pages.create']}
        },
        {
            path: 'pages/:id/edit',
            component: CrupdatePageComponent,
            data: {permissions: ['pages.update']}
        },
        {
            path: 'reports',
            component: ReportsComponent,
            data: {permissions: ['reports.view']},
            children: [
                {path: '', redirectTo: 'conversations'},
                {path: 'envato', component: EnvatoReportsComponent},
                {path: 'conversations', component: TicketsReportComponent},
            ]
        },
        {
            path: 'settings',
            component: SettingsComponent,
            resolve: {settings: SettingsResolve},
            data: {permissions: ['settings.view']},
            children: [
                {path: '', redirectTo: 'ticketing'},
                {path: 'authentication', component: AuthenticationSettingsComponent},
                {path: 'cache', component: CacheSettingsComponent},
                {path: 'envato', component: EnvatoSettingsComponent},
                {path: 'help-center', component: HelpCenterSettingsComponent},
                {path: 'permissions', component: PermissionsSettingsComponent},
                {path: 'realtime', component: RealtimeSettingsComponent},
                {path: 'ticketing', component: TicketingSettingsComponent},
                {path: 'localization', component: LocalizationSettingsComponent},
                {path: 'mail', component: MailSettingsComponent},
                {path: 'logging', component: LoggingSettingsComponent},
                {path: 'search', component: SearchSettingsComponent},
                {path: 'queue', component: QueueSettingsComponent},
            ]
        },
        {
            path: 'tickets',
            component: TicketsComponent,
            resolve: {tickets: TicketsResolve},
            data: {permissions: ['tickets.view', 'tickets.create', 'tickets.delete', 'tickets.edit']}
        },
        {
            path: 'tickets/ticket/:ticket_id',
            component: ConversationComponent,
            data: {permissions: ['tickets.view']},
            resolve: {ticket: TicketResolve}
        },
        {
            path: 'tickets/new',
            component: NewTicketComponent,
            data: {permissions: ['tickets.create']},
            resolve: {data: NewTicketCategoriesResolve},
        },

    ]},
    {
        path: 'appearance',
        loadChildren: 'app/admin/appearance/appearance.module#AppearanceModule',
        data: {permissions: ['appearance.update']},
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}
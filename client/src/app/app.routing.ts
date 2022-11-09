import {Routes, RouterModule} from '@angular/router';
import {AccountSettingsComponent} from "./user/account-settings/account-settings.component";
import {AuthGuard} from "./guards/auth-guard.service";
import {AccountSettingsResolve} from "./user/account-settings/account-settings-resolve.service";
import {NotFoundPageComponent} from "./shared/not-found/not-found-page.component";
import {CheckPermissionsGuard} from "./guards/check-permissions-guard.service";
import {PageComponent} from "./pages/page.component";

const routes: Routes = [
    {path: '', canActivateChild: [CheckPermissionsGuard], children: [
        {
            path: '',
            redirectTo: 'help-center',
            pathMatch: 'full'
        },
        {
            path: 'mailbox',
            loadChildren: 'app/ticketing/ticketing.module#TicketingModule'
        },
        {
            path: 'admin',
            loadChildren: 'app/admin/admin.module#AdminModule'
        },
        {
            path: 'account/settings',
            component: AccountSettingsComponent,
            canActivate: [AuthGuard],
            resolve: {resolves: AccountSettingsResolve}
        },
        {
            path: 'pages/:id/:slug',
            component: PageComponent,
            data: {permissions: ['pages.view']}
        },
        {
            path: '**',
            component: NotFoundPageComponent
        },
    ]}
];

export const routing = RouterModule.forRoot(routes);
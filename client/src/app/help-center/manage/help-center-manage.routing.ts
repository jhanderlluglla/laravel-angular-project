import {RouterModule} from '@angular/router';
import {AuthGuard} from "../../guards/auth-guard.service";
import {NewArticleComponent} from "./new-article/new-article.component";
import {NewArticleResolve} from "./new-article/new-article-resolve.service";
import {ArticlesListComponent} from "./articles-list/articles-list.component";
import {HelpCenterManageComponent} from "./help-center-manage.component";
import {CategoriesListComponent} from "./categories-list/categories-list.component";

export const routing = RouterModule.forChild([
    {path: '', component: HelpCenterManageComponent, canActivate: [AuthGuard], data: {permissions: ['access.help_center_manage']}, children: [
        {
            path: '',
            redirectTo: 'articles'
        },
        {
            path: 'articles',
            component: ArticlesListComponent,
            data: {permissions: ['categories.view', 'tags.view', 'articles.view']}
        },
        {
            path: 'categories',
            component: CategoriesListComponent,
            data: {permissions: ['categories.view']}
        },
        {
            path: 'articles/new',
            component: NewArticleComponent,
            resolve: {data: NewArticleResolve},
            data: {permissions: ['articles.create']}
        },
        {
            path: 'articles/:article_id/edit',
            component: NewArticleComponent,
            resolve: {data: NewArticleResolve},
            data: {permissions: ['articles.update']}
        },
    ]},
]);
import {NgModule}           from '@angular/core';
import {CommonModule}       from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from "../../shared.module";
import {TextEditorModule} from "../../text-editor/text-editor.module";
import {NewArticleComponent} from "./new-article/new-article.component";
import {NewArticleResolve} from "./new-article/new-article-resolve.service";
import {ArticlesListFiltersComponent} from "./articles-list/articles-list-filters/articles-list-filters.component";
import {ArticlesListComponent} from "./articles-list/articles-list.component";
import {ArticleSettingsModalComponent} from "./new-article/article-settings-modal/article-settings-modal.component";
import {CategoriesManagerComponent} from "./categories-manager/categories-manager.component";
import {HelpCenterManageComponent} from "./help-center-manage.component";
import {CategoryModalComponent} from "./category-modal/category-modal.component";
import {CategoriesListComponent} from "./categories-list/categories-list.component";
import {CategoryListItemComponent} from "./categories-list/category-list-item/category-list-item.component";
import {routing} from "./help-center-manage.routing";
import {HelpCenterSharedModule} from "../shared/help-center-shared.module";
import {ModalService} from "../../shared/modal/modal.service";
import {UserModule} from "../../user/user.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        TextEditorModule,
        HelpCenterSharedModule,
        UserModule,
        routing
    ],
    declarations: [
        HelpCenterManageComponent,
        ArticlesListComponent,
        ArticlesListFiltersComponent,
        //TagsManagerComponent,
        CategoriesManagerComponent,
        NewArticleComponent,
        CategoryModalComponent,
        ArticleSettingsModalComponent,
        CategoriesListComponent,
        CategoryListItemComponent,
    ],
    exports:      [],
    providers:    [NewArticleResolve, ModalService],
    entryComponents: [
        CategoryModalComponent,
        ArticleSettingsModalComponent,
    ],
})
export class HcManageModule { }
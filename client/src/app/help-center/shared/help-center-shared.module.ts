import {NgModule} from '@angular/core';
import {ArticlesOrderSelectComponent} from "./articles-order-select/articles-order-select.component";
import {HelpCenterService} from "./help-center.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared.module";
import {ArticleComponent} from "./article/article.component";
import {ArticleModalComponent} from "./article-modal/article-modal.component";
import {ArticleFeedbackComponent} from "./article-feedback/article-feedback.component";
import {ArticleResolve} from "./article/article-resolve.service";
import {ModalService} from "../../shared/modal/modal.service";
import {BreadCrumbsComponent} from "../front/breadcrumbs/breadcrumbs.component";
import {HcCompactHeaderComponent} from "../front/hc-compact-header/hc-compact-header.component";
import {RouterModule} from "@angular/router";
import {SuggestedArticlesDropdownComponent} from "../front/suggested-articles-dropdown/suggested-articles-dropdown.component";
import {CategoriesService} from "./categories.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        ArticleComponent,
        ArticlesOrderSelectComponent,
        ArticleModalComponent,
        ArticleFeedbackComponent,
        BreadCrumbsComponent,
        HcCompactHeaderComponent,
        SuggestedArticlesDropdownComponent,
    ],
    exports:      [
        ArticleComponent,
        ArticlesOrderSelectComponent,
        ArticleModalComponent,
        ArticleFeedbackComponent,
        BreadCrumbsComponent,
        HcCompactHeaderComponent,
        SuggestedArticlesDropdownComponent,
    ],
    entryComponents: [
        ArticleModalComponent
    ],
    providers: [
        HelpCenterService,
        CategoriesService,
        ArticleResolve,
        ModalService
    ],
})
export class HelpCenterSharedModule { }
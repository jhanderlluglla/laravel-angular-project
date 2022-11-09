import {NgModule}           from '@angular/core';
import {CommonModule}       from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from "../../shared.module";
import {TextEditorModule} from "../../text-editor/text-editor.module";
import {HelpCenterComponent} from "./help-center.component";
import {HelpCenterSharedModule} from "../shared/help-center-shared.module";
import {HelpCenterResolve} from "./help-center-resolve.service";
import {ArticleHostComponent} from "./article-host/article-host.component";
import {BreadCrumbsComponent} from "./breadcrumbs/breadcrumbs.component";
import {CategoryComponent} from "./category/category.component";
import {CategoryResolve} from "./category/category-resolve.service";
import {HcHeaderComponent} from "./hc-header/hc-header.component";
import {HcCompactHeaderComponent} from "./hc-compact-header/hc-compact-header.component";
import {TopicsPanelComponent} from "./topics-panel/topics-panel.component";
import {CustomerFooterComponent} from "../../shared/customer-footer/customer-footer.component";
import {ModalService} from "../../shared/modal/modal.service";
import {HcSearchPageComponent} from './hc-search-page/hc-search-page.component';
import {HcSearchPageResolve} from "./hc-search-page/hc-search-page-resolve.service";
import {HelpCenterRoutingModule} from "./help-center.routing";

@NgModule({
    imports:      [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        TextEditorModule,
        HelpCenterSharedModule,
        HelpCenterRoutingModule,
    ],
    declarations: [
        HelpCenterComponent,
        HcHeaderComponent,
        CategoryComponent,
        ArticleHostComponent,
        TopicsPanelComponent,
        HcSearchPageComponent,
    ],
    exports:      [HcCompactHeaderComponent, BreadCrumbsComponent, CustomerFooterComponent],
    providers:    [HelpCenterResolve, CategoryResolve, ModalService, HcSearchPageResolve]
})
export class HelpCenterModule { }
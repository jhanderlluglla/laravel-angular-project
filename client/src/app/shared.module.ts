import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ToastComponent} from "./shared/toast/toast.component";
import {TooltipDirective} from "./shared/tooltip/tooltip.component";
import {MapToIterable} from "./shared/map-to-iterable";
import {ConfirmModalComponent} from "./shared/modal/confirm-modal/confirm-modal.component";
import {LoadingIndicatorComponent} from "./shared/loading-indicator/loading-indicator.component";
import {CustomScrollbarDirective} from "./shared/custom-scrollbar/custom-scrollbar.directive";
import {CustomerNavbarComponent} from "./shared/customer-navbar/customer-navbar.component";
import {CustomerFooterComponent} from "./shared/customer-footer/customer-footer.component";
import {TrushHtmlPipe} from "./shared/trust-html.pipe";
import {PaginationControlsComponent} from "./shared/pagination/pagination-controls/pagination-controls.component";
import {LoggedInUserWidgetComponent} from "./shared/logged-in-user-widget/logged-in-user-widget.component";
import {UploadProgressBar} from "./shared/upload-progress-bar/upload-progress-bar.component";
import {SvgIconComponent} from "./shared/svg-icon/svg-icon.component";
import {InfiniteScrollDirective} from "./shared/infinite-scroll/infinite-scroll.directive";
import {NoResultsMessageComponent} from "./shared/no-results-message/no-results-message.component";
import {DropdownComponent} from "./shared/dropdown/dropdown.component";
import {NotFoundPageComponent} from "./shared/not-found/not-found-page.component";
import {CustomMenuComponent} from "./shared/custom-menu/custom-menu.component";
import {ReorderDirective} from "./shared/reorder.directive";
import {TranslateDirective} from "./shared/translations/translate.directive";
import {PageComponent} from "./pages/page.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    declarations: [
        InfiniteScrollDirective,
        ToastComponent,
        TooltipDirective,
        MapToIterable,
        ConfirmModalComponent,
        LoadingIndicatorComponent,
        CustomerNavbarComponent,
        CustomerFooterComponent,
        LoggedInUserWidgetComponent,
        CustomScrollbarDirective,
        TrushHtmlPipe,
        UploadProgressBar,
        SvgIconComponent,
        NoResultsMessageComponent,
        PaginationControlsComponent,
        DropdownComponent,
        NotFoundPageComponent,
        PageComponent,
        CustomMenuComponent,
        ReorderDirective,
        TranslateDirective,
    ],
    exports: [
        MapToIterable,
        TrushHtmlPipe,
        ConfirmModalComponent,
        LoadingIndicatorComponent,
        TooltipDirective,
        ToastComponent,
        InfiniteScrollDirective,
        CustomScrollbarDirective,
        CustomerNavbarComponent,
        CustomerFooterComponent,
        LoggedInUserWidgetComponent,
        UploadProgressBar,
        SvgIconComponent,
        NoResultsMessageComponent,
        PaginationControlsComponent,
        DropdownComponent,
        ReorderDirective,
        TranslateDirective,
    ],
    entryComponents: [
        ConfirmModalComponent,
    ],
    providers: [],
})
export class SharedModule { }
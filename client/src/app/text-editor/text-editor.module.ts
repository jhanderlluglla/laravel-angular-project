import {NgModule}           from '@angular/core';
import {CommonModule}       from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TextEditorComponent} from "./text-editor.component";
import {SharedModule} from "../shared.module";
import {InsertImageModalComponent} from "./insert-image-modal/insert-image-modal.component";
import {FileDropzoneDirective} from "../shared/file-dropzone/file-dropzone.directive";

@NgModule({
    imports:      [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
    declarations: [
        TextEditorComponent,
        InsertImageModalComponent,
        FileDropzoneDirective
    ],
    entryComponents: [
        InsertImageModalComponent,
    ],
    exports: [
        TextEditorComponent,
    ],
})
export class TextEditorModule { }
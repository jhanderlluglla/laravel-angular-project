import {NgModule} from "@angular/core";
import {FilePreviewComponent} from "./file-preview.component";
import {FilePreviewModalComponent} from "./file-preview-modal.component";
import {TextPreviewComponent} from "./text/text-preview.component";
import {ImagePreviewComponent} from "./image/image-preview.component";
import {AudioVideoPreviewComponent} from "./audio-video/audio-video-preview.component";
import {PdfPreviewComponent} from "./pdf/pdf-preview.component";
import {ZipPreviewComponent} from "./zip/zip-preview.component";
import {SharedModule} from "../../shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
    declarations: [
        FilePreviewComponent,
        FilePreviewModalComponent,
        TextPreviewComponent,
        ImagePreviewComponent,
        AudioVideoPreviewComponent,
        PdfPreviewComponent,
        ZipPreviewComponent,
    ],
    entryComponents: [
        FilePreviewModalComponent,
        TextPreviewComponent,
        ImagePreviewComponent,
        AudioVideoPreviewComponent,
        PdfPreviewComponent,
        ZipPreviewComponent,
    ],
    exports:      [],
    providers:    []
})
export class FilePreviewModule { }
import {Input, Component, ComponentFactoryResolver, ViewContainerRef, ViewChild, ViewEncapsulation, ElementRef, Renderer2, AfterContentInit, ComponentRef} from '@angular/core';
import {ZipPreviewComponent} from "./zip/zip-preview.component";
import {TextPreviewComponent} from "./text/text-preview.component";
import {ImagePreviewComponent} from "./image/image-preview.component";
import {AudioVideoPreviewComponent} from "./audio-video/audio-video-preview.component";
import {PdfPreviewComponent} from "./pdf/pdf-preview.component";
import {LoadingIndicatorComponent} from "../loading-indicator/loading-indicator.component";
import {UploadsService} from "../uploads.service";
import {Upload} from "../models/Upload";

@Component({
    selector: 'file-preview',
    templateUrl: './file-preview.component.html',
    styleUrls: ['./file-preview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class FilePreviewComponent implements AfterContentInit {
    @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
    @ViewChild(LoadingIndicatorComponent) loadingIndicator: LoadingIndicatorComponent;
    @ViewChild('noPreviewContainer') noPreviewContainer: ElementRef;

    /**
     * Files to load into preview gallery.
     */
    @Input() files: Upload[] = [];

    /**
     * Index of file that should be displayed by default.
     */
    @Input() index = 0;

    /**
     * Current file preview component instance.
     */
    private currentPreviewCmp: ComponentRef<any>;

    /**
     * FilePreviewComponent constructor.
     */
    constructor(private cr: ComponentFactoryResolver, private renderer: Renderer2, private uploads: UploadsService) {}

    /**
     * Lifecycle hook that is called after component content has been fully initialized.
     */
    ngAfterContentInit() {
        if (this.files.length) {
            this.previewFile(this.files[this.index]);
        }
    }

    /**
     * Show a preview for given file if possible.
     */
    public previewFile(file) {
        this.clear();

        let component = this.getPreviewComponent(file);

        //can't preview this file type, bail
        if ( ! component) return this.showNoPreviewMessage();

        this.loadingIndicator.show();

        let factory = this.cr.resolveComponentFactory(component);

        this.currentPreviewCmp = this.container.createComponent(factory);
        this.currentPreviewCmp.instance.showPreview(file).then(() => {
            this.loadingIndicator.hide();
        }, () => {
            this.loadingIndicator.hide();
            this.showNoPreviewMessage();
        });
    }

    /**
     * Show "no preview" message if current file type is not supported.
     */
    private showNoPreviewMessage() {
        this.clear();
        this.renderer.removeClass(this.noPreviewContainer.nativeElement, 'hidden');
    }

    /**
     * Get correct file preview component depending on give file mime type.
     */
    private getPreviewComponent(file: Upload): any {
        let split   = file.mime.split('/'),
            type    = split[0],
            subtype = split[1];

        let zipTypes = ['zip', 'x-rar', 'x-rar-compressed', 'x-7z-compressed', 'x-ace-compressed'],
            txtTypes = ['txt', 'x-httpd-php'];

        if (type === 'text' || txtTypes.indexOf(subtype) > -1) {
            return TextPreviewComponent;
        } else if (type === 'image') {
            return ImagePreviewComponent;
        } else if (type === 'audio' || type === 'video') {
            return AudioVideoPreviewComponent;
        } else if (type === 'application' && subtype === 'pdf') {
            return PdfPreviewComponent;
        } else if (type === 'application' && zipTypes.indexOf(subtype) > -1) {
            return ZipPreviewComponent;
        } else {
            return false;
        }
    }

    /**
     * Preview next file in file list if there are any.
     */
    public nextFile() {
        let index = this.index+1;
        if (this.files[index]) {
            this.index = index;
            this.previewFile(this.files[index]);
        }
    }

    /**
     * Preview previous file in file list if there are any.
     */
    public previousFile() {
        let index = this.index-1;
        if (this.files[index]) {
            this.index = index;
            this.previewFile(this.files[index]);
        }
    }

    /**
     * Remove any file previews that are currently active.
     */
    public clear() {
        if (this.currentPreviewCmp) {
            this.currentPreviewCmp.destroy();
        }

        if (this.noPreviewContainer) {
            this.renderer.addClass(this.noPreviewContainer.nativeElement, 'hidden');
        }
    }

    /**
     * Download file that is currently being previewed.
     */
    public downloadFile() {
        this.uploads.downloadFile(this.files[this.index]);
    }
}

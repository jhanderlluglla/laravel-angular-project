import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {UploadsService} from "../../shared/uploads.service";
import {SettingsService} from "../../shared/settings.service";
import {BaseModalClass} from "../../shared/modal/base-modal";

@Component({
    selector: 'insert-image-modal',
    templateUrl: './insert-image-modal.component.html',
    styleUrls: ['./insert-image-modal.component.scss'],
    providers: [UploadsService],
    encapsulation: ViewEncapsulation.None,
})
export class InsertImageModalComponent extends BaseModalClass {

    /**
     * Type of static image (article or ticket).
     */
    public uploadType: string;

    /**
     * Name of current active tab.
     */
    public activeTab: string = 'upload';

    /**
     * Model for image url.
     */
    public linkModel: string;

    /**
     * File upload errors (if there are any).
     */
    public errors: Object|boolean;

    /**
     * InsertImageModal Constructor.
     */
    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private uploads: UploadsService,
        private settings: SettingsService
    ) {
        super(elementRef, renderer);
    }

    /**
     * Show the modal.
     */
    public show(params: {uploadType: string}) {
        this.uploadType = params.uploadType;
        super.show(params);
    }

    /**
     * Close modal and reset its state.
     */
    public close() {
        super.close();
        this.linkModel = null;
    }

    /**
     * Fired when user is done with this modal.
     */
    public confirm() {
        if (this.errors) return;

        this.onDone.emit(this.linkModel);
        this.close();
    }

    /**
     * Set active tab to specified one.
     */
    public setActiveTab(name: string) {
        this.activeTab = name;
    }

    /**
     * Set specified link as link model.
     */
    public setLinkModel(link: string) {
        this.errors = false;

        this.validateImage(link).then(() => {
            this.linkModel = link;
        }).catch(() => {
            this.errors = {'*': 'The URL provided is not a valid image.'};
        });
    }

    /**
     * Open browser dialog for selecting files, upload files
     * and set linkModel to absolute url of uploaded image.
     */
    public uploadFiles(files: FileList) {
        this.errors = this.uploads.filesAreInvalid(files);
        if (this.errors) return;

        this.uploads.uploadStaticImages(files, this.uploadType).subscribe(response => {
            this.linkModel = this.settings.getBaseUrl(true)+response.data[0].url;
            this.confirm();
        }, response => this.errors = response.messages);
    }

    /**
     * Check if image at specified url exists and is valid.
     */
    private validateImage(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let timeout = 500;
            let timer, img = new Image();

            //image is invalid
            img.onerror = img.onabort = () => {
                clearTimeout(timer);
                reject();
            };

            //image is valid
            img.onload = function () {
                clearTimeout(timer);
                resolve();
            };

            //reject image if loading it times out
            timer = setTimeout(function () {
                img = null; reject();
            }, timeout);

            img.src = url;
        });
    }
}
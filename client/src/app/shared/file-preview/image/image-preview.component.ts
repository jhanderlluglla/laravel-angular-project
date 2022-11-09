import {Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'image-preview',
    template: '<img #imageElement>',
    styleUrls: ['./image-preview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ImagePreviewComponent implements AfterViewInit {
    @ViewChild('imageElement') imageElement: ElementRef;
    
    /**
     * File model instance.
     */
    private fileModel;

    /**
     * Resolve/Reject promise when this preview is displayed.
     */
    private resolve;
    private reject;

    ngAfterViewInit() {
        this.imageElement.nativeElement.src = this.fileModel.url;
        this.resolve();
    }

    public showPreview(file) {
        this.fileModel = file;

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
    }
}

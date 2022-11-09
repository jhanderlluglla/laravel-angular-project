import {Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'pdf-preview',
    template: `<iframe src="about:blank" #iframe></iframe>`,
    styleUrls: ['./pdf-preview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class PdfPreviewComponent implements AfterViewInit {
    @ViewChild('iframe') iframe: ElementRef;

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
        this.iframe.nativeElement.onload = () => {
            this.resolve();
        };

        this.iframe.nativeElement.src = this.fileModel.url;
    }

    public showPreview(file) {
        this.fileModel = file;

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
    }
}

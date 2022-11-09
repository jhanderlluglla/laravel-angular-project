import {Component, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {Upload} from "../../models/Upload";

@Component({
    selector: 'audio-video-preview',
    template: `<video controls="true" autoplay="false" #playerElement></video>`
})

export class AudioVideoPreviewComponent implements AfterViewInit {
    @ViewChild('playerElement') playerElement: ElementRef;

    /**
     * File model instance.
     */
    private fileModel: Upload;

    /**
     * Resolve/Reject promise when this preview is displayed.
     */
    private resolve;
    private reject;

    ngAfterViewInit() {
        if ( ! document.createElement('audio').canPlayType(this.fileModel.mime)) {
            return this.reject();
        }
        
        this.playerElement.nativeElement.src = this.fileModel.url;

        this.resolve();
    }

    public showPreview(file: Upload) {
        this.fileModel = file;

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
    }
}

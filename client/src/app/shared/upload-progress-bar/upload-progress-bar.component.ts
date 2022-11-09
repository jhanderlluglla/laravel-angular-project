import {
    Component, OnInit, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy,
    ViewEncapsulation
} from "@angular/core";
import {UploadProgressService} from "../upload-progress.service";

@Component({
    selector: 'upload-progress-bar',
    template: `<div class="progress-inner" #progressBarInner></div>`,
    styleUrls: ['./upload-progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UploadProgressBar implements OnInit {
    @ViewChild('progressBarInner') progressBarInner: ElementRef;

    constructor(private uploadProgress: UploadProgressService, private renderer: Renderer2, private el: ElementRef) {}
    
    ngOnInit() {

        //show progress bar when file upload starts
        this.uploadProgress.onStart$.subscribe(() => {
            this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
        });

        //increment progress bar during upload
        this.uploadProgress.onProgress$.subscribe(num => {
            this.renderer.setStyle(this.progressBarInner.nativeElement, 'width', num+'%');
        });

        //hide progress bar when files are uploaded
        this.uploadProgress.onEnd$.subscribe(() => {
            this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
        });
    }
}
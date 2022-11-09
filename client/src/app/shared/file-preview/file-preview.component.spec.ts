import {KarmaTest} from "../../../../testing/karma-test";
import {FilePreviewComponent} from "./file-preview.component";
import {Upload} from "../models/Upload";
import {LoadingIndicatorComponent} from "../loading-indicator/loading-indicator.component";
import {TextPreviewComponent} from "./text/text-preview.component";
import {UploadsService} from "../uploads.service";
import {FileValidator} from "../file-validator";
import {BehaviorSubject, Observable} from "rxjs";
import {fakeAsync, tick} from "@angular/core/testing";
import {ImagePreviewComponent} from "./image/image-preview.component";
import {AudioVideoPreviewComponent} from "./audio-video/audio-video-preview.component";
import {PdfPreviewComponent} from "./pdf/pdf-preview.component";
import {ZipPreviewComponent} from "./zip/zip-preview.component";
import {MapToIterable} from "../map-to-iterable";

describe('FilePreviewComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    FilePreviewComponent, LoadingIndicatorComponent, TextPreviewComponent, ImagePreviewComponent,
                    AudioVideoPreviewComponent, PdfPreviewComponent, ZipPreviewComponent, MapToIterable
                ],
                entryComponents: [TextPreviewComponent, ImagePreviewComponent, AudioVideoPreviewComponent, PdfPreviewComponent, ZipPreviewComponent],
                providers: [UploadsService, FileValidator],
            },
            component: FilePreviewComponent
        });
    });

    it('previews specified file', fakeAsync(() => {
        spyOn(testBed.component, 'showNoPreviewMessage');
        spyOn(testBed.component, 'nextFile');
        spyOn(testBed.component, 'previousFile');
        spyOn(testBed.get(UploadsService), 'getFileContents').and.returnValue(new BehaviorSubject('content'));

        testBed.component.files = [new Upload(), new Upload({mime: 'text/plain', name: 'foo.txt'}), new Upload()];
        testBed.component.index = 1;
        testBed.fixture.detectChanges();

        //does not show "no preview" element
        expect(testBed.component.showNoPreviewMessage).not.toHaveBeenCalled();

        //shows loading indicator
        expect(testBed.find('loading-indicator .spinner')).toBeTruthy();

        //resolves preview component properly
        expect(testBed.component.currentPreviewCmp.instance instanceof TextPreviewComponent).toEqual(true);

        tick();
        testBed.fixture.detectChanges();

        //hides loading indicator after preview component is loaded
        expect(testBed.find('loading-indicator .spinner')).toBeFalsy();

        //shows preview
        expect(testBed.find('text-preview').textContent).toEqual('content');

        //renders next file button
        testBed.find('.next').click();
        expect(testBed.component.nextFile).toHaveBeenCalledTimes(1);

        //renders previous file button
        testBed.find('.previous').click();
        expect(testBed.component.previousFile).toHaveBeenCalledTimes(1);

        //renders total files element
        expect(testBed.find('.total-files').textContent).toContain('2');
    }));

    it('shows "no preview" message if preview component returns rejected promise', fakeAsync(() => {
        spyOn(testBed.component, 'showNoPreviewMessage');
        spyOn(testBed.get(UploadsService), 'getFileContents').and.returnValue(Observable.throw({}));
        spyOn(testBed.get(UploadsService), 'downloadFile');

        testBed.component.files = [new Upload({mime: 'text/plain', name: 'foo.txt'}), new Upload()];
        testBed.fixture.detectChanges();
        tick();

        //shows preview message
        expect(testBed.component.showNoPreviewMessage).toHaveBeenCalledTimes(1);

        //downloads file
        testBed.find('.download-button').click();
        expect(testBed.get(UploadsService).downloadFile).toHaveBeenCalledWith(testBed.component.files[testBed.component.index]);
    }));

    it('shows "no preview" message if file cant be previewed', () => {
        spyOn(testBed.component.cr, 'resolveComponentFactory');
        spyOn(testBed.component, 'clear');

        //"no preview" element is hidden by default
        expect(testBed.find('.no-preview').classList.contains('hidden')).toEqual(true);

        testBed.component.files = [new Upload({mime: 'foo/bar', name: 'foo.bar'})];
        testBed.fixture.detectChanges();

        //does not try to resolve preview component
        expect(testBed.component.cr.resolveComponentFactory).not.toHaveBeenCalled();

        //clears previous file preview data
        expect(testBed.component.clear).toHaveBeenCalled();

        //shows "no preview" element
        expect(testBed.find('.no-preview').classList.contains('hidden')).toEqual(false);
    });

    it('loads correct preview component based on file mime type', () => {
        //text
        testBed.component.previewFile(new Upload({mime: 'text/plain'}));
        expect(testBed.component.currentPreviewCmp.instance instanceof TextPreviewComponent).toEqual(true);

        //image
        testBed.component.previewFile(new Upload({mime: 'image/png'}));
        expect(testBed.component.currentPreviewCmp.instance instanceof ImagePreviewComponent).toEqual(true);

        //audio/video
        testBed.component.previewFile(new Upload({mime: 'audio/mp3'}));
        expect(testBed.component.currentPreviewCmp.instance instanceof AudioVideoPreviewComponent).toEqual(true);
        testBed.component.previewFile(new Upload({mime: 'video/mp4'}));
        expect(testBed.component.currentPreviewCmp.instance instanceof AudioVideoPreviewComponent).toEqual(true);

        //pdf
        testBed.component.previewFile(new Upload({mime: 'application/pdf'}));
        expect(testBed.component.currentPreviewCmp.instance instanceof PdfPreviewComponent).toEqual(true);

        //zip
        testBed.component.previewFile(new Upload({mime: 'application/zip'}));
        expect(testBed.component.currentPreviewCmp.instance instanceof ZipPreviewComponent).toEqual(true);
    });

    it('loads next and previous files', () => {
        spyOn(testBed.component, 'previewFile');
        testBed.component.files = [new Upload({name: 'foo'}), new Upload({name: 'bar'}), new Upload({name: 'baz'})];
        testBed.component.index = 0;

        //loads next file (at index 1)
        testBed.component.nextFile();
        expect(testBed.component.previewFile).toHaveBeenCalledWith(testBed.component.files[1]);

        //loads previous file (at index 0)
        testBed.component.previousFile();
        expect(testBed.component.previewFile).toHaveBeenCalledWith(testBed.component.files[0]);
    });
});
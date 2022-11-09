import {fakeAsync, tick} from "@angular/core/testing";
import {Upload} from "../../models/Upload";
import {UploadsService} from "../../uploads.service";
import {KarmaTest} from "../../../../../testing/karma-test";
import {FileValidator} from "../../file-validator";
import {AudioVideoPreviewComponent} from "./audio-video-preview.component";

describe('AudioVideoPreviewComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    AudioVideoPreviewComponent
                ],
                providers: [UploadsService, FileValidator],
            },
            component: AudioVideoPreviewComponent
        });
    });

    it('previews audio or video files', fakeAsync(() => {
        let upload = new Upload({url: 'http://foo.bar', mime: 'audio/mp3'});
        let promiseResolved = false;

        testBed.component.showPreview(upload).then(() => promiseResolved = true);
        testBed.fixture.detectChanges();
        tick();

        //loads video
        expect(testBed.find('video')['src']).toContain(upload.url);

        //resolves promise
        expect(promiseResolved).toEqual(true);
    }));

    it('does not show preview if audio or video type is not supported', fakeAsync(() => {
        let upload = new Upload({url: 'http://foo.bar', mime: 'audio/foo'});
        let promiseRejected = false;

        testBed.component.showPreview(upload).catch(() => promiseRejected = true);
        testBed.fixture.detectChanges();
        tick();

        //does not load video
        expect(testBed.find('video')['src']).toBeFalsy();

        //rejects promise
        expect(promiseRejected).toEqual(true);
    }));


});
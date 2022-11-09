import {fakeAsync, tick} from "@angular/core/testing";
import {Upload} from "../../models/Upload";
import {UploadsService} from "../../uploads.service";
import {KarmaTest} from "../../../../../testing/karma-test";
import {FileValidator} from "../../file-validator";
import {ImagePreviewComponent} from "./image-preview.component";

describe('ImagePreviewComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    ImagePreviewComponent
                ],
                providers: [UploadsService, FileValidator],
            },
            component: ImagePreviewComponent
        });
    });

    it('previews image files', fakeAsync(() => {
        let upload = new Upload({url: 'http://foo.bar'});
        let promiseResolved = false;

        testBed.component.showPreview(upload).then(() => promiseResolved = true);
        testBed.fixture.detectChanges();
        tick();

        //loads image
        expect(testBed.find('img')['src']).toContain(upload.url);

        //resolves promise
        expect(promiseResolved).toEqual(true);
    }));
});
import {fakeAsync, tick} from "@angular/core/testing";
import {Upload} from "../../models/Upload";
import {UploadsService} from "../../uploads.service";
import {KarmaTest} from "../../../../../testing/karma-test";
import {FileValidator} from "../../file-validator";
import {PdfPreviewComponent} from "./pdf-preview.component";

describe('PdfPreviewComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    PdfPreviewComponent
                ],
                providers: [UploadsService, FileValidator],
            },
            component: PdfPreviewComponent
        });
    });

    it('previews PDF files', fakeAsync(() => {
        let upload = new Upload({url: 'http://foo.bar'});

        testBed.component.showPreview(upload);
        testBed.fixture.detectChanges();
        tick();

        //loads pdf into iframe
        expect(testBed.find('iframe')['src']).toContain(upload.url);
    }));
});
import {TextPreviewComponent} from "./text-preview.component";
import {fakeAsync, tick} from "@angular/core/testing";
import {Upload} from "../../models/Upload";
import {UploadsService} from "../../uploads.service";
import {BehaviorSubject} from "rxjs";
import {utils} from "../../utils";
import {KarmaTest} from "../../../../../testing/karma-test";
import {FileValidator} from "../../file-validator";

describe('TextPreviewComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    TextPreviewComponent
                ],
                providers: [UploadsService, FileValidator],
            },
            component: TextPreviewComponent
        });
    });

    xit('previews text files', fakeAsync(() => {
        let upload = new Upload({mime: 'text/plain', name: 'foo.txt'});
        let promiseResolved = false;
        spyOn(testBed.get(UploadsService), 'getFileContents').and.returnValue(new BehaviorSubject('content'));
        spyOn(testBed.get(utils), 'loadScript').and.returnValue(new Promise(resolve => resolve()));

        testBed.component.showPreview(upload).then(() => promiseResolved = true);
        testBed.fixture.detectChanges();
        tick(50);

        //fetches file contents from backend
        expect(testBed.get(UploadsService).getFileContents).toHaveBeenCalledWith(upload);

        //sets contents returned from backend on component instance
        expect(testBed.component.contents).toEqual('content');

        //renders text content
        let codeEl = testBed.find('code');
        expect(codeEl.textContent).toEqual('content');

        //adds language type to "code" element
        expect(codeEl.classList.contains('language-txt')).toEqual(true);

        //resolves promise returned from "showPreview" method
        expect(promiseResolved).toEqual(true);
    }));
});
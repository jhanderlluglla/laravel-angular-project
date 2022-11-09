import {KarmaTest} from "../../../../testing/karma-test";
import {FilePreviewModalComponent} from "./file-preview-modal.component";
import {FilePreviewComponent} from "./file-preview.component";
import {UploadsService} from "../uploads.service";
import {FileValidator} from "../file-validator";
import {fakeAsync, tick} from "@angular/core/testing";
import {LoadingIndicatorComponent} from "../loading-indicator/loading-indicator.component";
import {Upload} from "../models/Upload";
import {TextPreviewComponent} from "./text/text-preview.component";

describe('FilePreviewModalComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    FilePreviewModalComponent, FilePreviewComponent, LoadingIndicatorComponent, TextPreviewComponent
                ],
                entryComponents: [TextPreviewComponent],
                providers: [UploadsService, FileValidator],
            },
            component: FilePreviewModalComponent
        });
    });

    it('shows the modal', fakeAsync(() => {
        //sets index to 0 by default
        expect(testBed.component.index).toEqual(0);
        let files = [new Upload({id: 1}), new Upload({id: 2})];

        testBed.component.show({files: files, current: files[1]});
        tick(301);

        //sets index to specified current file
        expect(testBed.component.index).toEqual(1);

        //sets files on component instance
        expect(testBed.component.files).toEqual(files);
    }));

    it('renders file preview', fakeAsync(() => {
        let files = [new Upload(), new Upload({name: 'foo', mime: 'text/plain'})];
        spyOn(testBed.getChildComponent(FilePreviewComponent), 'downloadFile');

        testBed.component.show({files: files, current: files[1]});
        testBed.fixture.detectChanges();
        tick(301);

        //shows file name
        expect(testBed.find('.file-name').textContent).toEqual('foo');

        //downloads file
        testBed.find('.download-button').click();
        expect(testBed.getChildComponent(FilePreviewComponent).downloadFile).toHaveBeenCalledTimes(1);

        //closes modal
        testBed.find('.close-button').click();
        tick(201);
        expect(testBed.fixture.nativeElement.classList.contains('hidden')).toEqual(true);

        //renders file preview modal component
        expect(testBed.getChildComponent(FilePreviewComponent).files).toEqual(files);
        expect(testBed.getChildComponent(FilePreviewComponent).index).toEqual(1);
    }));
});
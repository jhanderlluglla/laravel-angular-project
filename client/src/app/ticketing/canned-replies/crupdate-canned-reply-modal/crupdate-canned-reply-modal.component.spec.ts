import {KarmaTest} from "../../../../../testing/karma-test";
import {TextEditorComponent} from "../../../text-editor/text-editor.component";
import {AttachmentsListComponent} from "../../../shared/attachments-list/attachments-list.component";
import {CrupdateCannedReplyModalComponent} from "./crupdate-canned-reply-modal.component";
import {UploadProgressBar} from "../../../shared/upload-progress-bar/upload-progress-bar.component";
import {CannedRepliesService} from "../canned-replies.service";
import {UploadsService} from "../../../shared/uploads.service";
import {FileValidator} from "../../../shared/file-validator";
import {BehaviorSubject, Observable} from "rxjs";
import {fakeAsync, tick} from "@angular/core/testing";

describe('CrupdateCannedReplyComponent', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [CrupdateCannedReplyModalComponent, TextEditorComponent, AttachmentsListComponent, UploadProgressBar],
                providers: [CannedRepliesService, UploadsService, FileValidator],
            },
            component: CrupdateCannedReplyModalComponent
        });
    });

    it('creates new canned reply', () => {
        let input = {name: 'foo name', body: 'foo contents', uploads: [{file_name: 'foo', mime: 'mime'}, {file_name: 'bar', mime: 'mime'}]};
        testBed.component.attachments = input.uploads;
        testBed.component.errors = [{name: 'error'}];
        testBed.fixture.detectChanges();

        //mock call to backend
        spyOn(testBed.get(CannedRepliesService), 'create').and.returnValue(new BehaviorSubject(true));

        //input canned reply name and contents
        testBed.typeIntoEl('#canned-reply-name', input.name);
        testBed.getChildComponent(TextEditorComponent).setContents(input.body);

        //click submit button
        testBed.find('.submit-button').click();

        //assert call to backend was made to create new canned reply
        expect(testBed.get(CannedRepliesService).create).toHaveBeenCalledWith(
            {name: input.name, body: input.body, uploads: [input.uploads[0].file_name, input.uploads[1].file_name]}
        );
    });

    it('displays errors returned from backend', () => {
        testBed.component.params = {ticketId: 1};
        spyOn(testBed.get(CannedRepliesService), 'create').and.returnValue(Observable.throw(
            {messages: {name: 'name error', body: 'body error', uploads: 'uploads error'}}
        ));

        //subscribe to onDone event
        let onDoneFired = false;
        testBed.component.onDone.subscribe(data => onDoneFired = true);

        testBed.component.confirm();

        //assert that onDone event was not fired
        expect(onDoneFired).toEqual(false);

        //assert that errors were correctly rendered
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.error')[0].textContent).toEqual('name error');
        expect(testBed.findAll('.error')[1].textContent).toEqual('body error');
        expect(testBed.findAll('.error')[2].textContent).toEqual('uploads error');
    });

    it('uploads and adds attachment to canned reply', () => {
        let file1 = {name: 'foo', mime: 'bar'}; let file2 = {name: 'baz', mime: 'bar'};
        testBed.component.attachments = [file1];

        spyOn(testBed.get(UploadsService), 'uploadFiles').and.returnValue(new BehaviorSubject({data: [file2]}));

        //fire "onFileUpload" event
        testBed.component.textEditor.onFileUpload.emit([file2]);
        testBed.fixture.detectChanges();

        //assert that user selected file was sent to backend for uploading
        expect(testBed.get(UploadsService).uploadFiles).toHaveBeenCalledWith([file2]);

        //assert that attachments were correctly set on component instance (concat)
        expect(testBed.component.attachments).toEqual([file1, file2]);

        //assert that attachment was passed to "AttachmentsListComponent" properly
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual([file1, file2]);
    });

    it('removes an attachment', () => {
        let files = [{name: 'foo', mime: 'bar', id: 1}, {name: 'bar', mime: 'baz', id: 2}];
        testBed.component.attachments = files;
        testBed.fixture.detectChanges();

        //remove attachment from "AttachmentsListComponent"
        testBed.getChildComponent(AttachmentsListComponent).removeAttachment(files[0]['id']);

        //assert that attachment was removed from component instance
        expect(testBed.component.attachments.length).toEqual(1);

        //assert that attachment was removed from "AttachmentsListComponent" properly as well
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual(testBed.component.attachments);
    });

    it('shows the modal', ()=> {
        testBed.fixture.detectChanges();
        let draft = {body: 'foo bar', uploads: [{name: 'baz'}]};
        testBed.component.show({cannedReply: draft});

        //assert specified reply draft model was set on component instance
        expect(testBed.getChildComponent(TextEditorComponent).getContents()).toEqual(draft.body);

        //assert attachments were set on component instance
        expect(testBed.component.attachments).toEqual(draft.uploads);

        //assert attachments were copied instead of setting reference
        expect(testBed.component.attachments).not.toBe(draft.uploads);

        //assert modal is visible in template
        expect(testBed.fixture.debugElement.nativeElement.classList.contains('hidden')).toEqual(false);
    });

    it('closes the modal', fakeAsync(() => {
        spyOn(testBed.getChildComponent(TextEditorComponent), 'destroyEditor');

        let onClosedFired = false;
        testBed.component.onClose.subscribe(() => onClosedFired = true);

        //close modal
        testBed.component.close();
        tick(201);

        //assert that modal was closed properly
        expect(onClosedFired).toEqual(true);

        //assert that text editor instance was destroyed
        expect(testBed.getChildComponent(TextEditorComponent).destroyEditor).toHaveBeenCalled();
    }));
});
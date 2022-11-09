import {KarmaTest} from "../../../../testing/karma-test";
import {TicketsService} from "../tickets.service";
import {BehaviorSubject, Observable} from "rxjs";
import {AddNoteModalComponent} from "./add-note-modal.component";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {UploadsService} from "../../shared/uploads.service";
import {utils} from "../../shared/utils";
import {SettingsService} from "../../shared/settings.service";
import {FileValidator} from "../../shared/file-validator";
import {UploadProgressBar} from "../../shared/upload-progress-bar/upload-progress-bar.component";
import {UploadProgressService} from "../../shared/upload-progress.service";
import {tick, fakeAsync} from "@angular/core/testing";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {TinymceTextEditor} from "../../text-editor/editors/tinymce-text-editor.service";
import {HtmlTextEditor} from "../../text-editor/editors/html-text-editor.service";

describe('AddNoteModal', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [AddNoteModalComponent, TextEditorComponent, AttachmentsListComponent, UploadProgressBar],
                providers: [UploadsService, TicketsService, utils, SettingsService, FileValidator, UploadProgressService, TinymceTextEditor, HtmlTextEditor],
            },
            component: AddNoteModalComponent
        });

        testBed.logInAsAdmin();
    });

    it('submits a new note to backend', () => {
        testBed.fixture.detectChanges();

        spyOn(testBed.get(TicketsService), 'addNote').and.returnValue(new BehaviorSubject({data: 'foo response'}));

        //add text to editor (also asserts that text editor component rendered properly)
        let editor = testBed.component.textEditor;
        editor.setContents('foo bar');

        //show modal
        testBed.component.show({ticketId: 1});

        //subscribe to onDone event
        let onDoneData: any = false;
        testBed.component.onDone.subscribe(data => onDoneData = data);

        //click submit button
        testBed.find('.submit-button').click();

        //assert that backend call was made with correct params
        expect(testBed.get(TicketsService).addNote).toHaveBeenCalledWith(1, {body: 'foo bar', attachments: []});

        //assert that onDone event was fired successfully
        expect(onDoneData).toEqual('foo response');
    });

    it('displays errors returned from backend', () => {
        testBed.component.params = {ticketId: 1};
        spyOn(testBed.get(TicketsService), 'addNote').and.returnValue(Observable.throw({messages: {body: 'body error', attachments: 'attachments error'}}));

        //subscribe to onDone event
        let onDoneFired = false;
        testBed.component.onDone.subscribe(data => onDoneFired = true);

        testBed.component.confirm();

        //assert that onDone event was not fired
        expect(onDoneFired).toEqual(false);

        //assert that error was correctly rendered
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.error')[0].textContent).toEqual('body error');
        expect(testBed.findAll('.error')[1].textContent).toEqual('attachments error');
    });

    it('uploads and adds attachment to note', () => {
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

    it('closes the modal', fakeAsync(() => {
        let onClosedFired = false;
        testBed.component.onClose.subscribe(() => onClosedFired = true);

        //close modal
        testBed.component.close();
        tick(201);

        //assert that modal was closed properly
        expect(onClosedFired).toEqual(true);
    }));
});
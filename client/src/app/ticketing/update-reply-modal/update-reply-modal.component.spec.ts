import {KarmaTest} from "../../../../testing/karma-test";
import {UpdateReplyModalComponent} from "./update-reply-modal.component";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {UploadProgressBar} from "../../shared/upload-progress-bar/upload-progress-bar.component";
import {TicketsService} from "../tickets.service";
import {UploadsService} from "../../shared/uploads.service";
import {FileValidator} from "../../shared/file-validator";
import {tick, fakeAsync} from "@angular/core/testing";
import {BehaviorSubject, Observable} from "rxjs";

describe('UpdateReplyModal', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [UpdateReplyModalComponent, TextEditorComponent, AttachmentsListComponent, UploadProgressBar],
                providers: [TicketsService, UploadsService, FileValidator],
            },
            component: UpdateReplyModalComponent,
        });
    });

    it('shows the modal', ()=> {
        testBed.fixture.detectChanges();

        spyOn(testBed.getChildComponent(TextEditorComponent), 'focus');

        let reply = {body: 'foo bar', uploads: [{name: 'baz'}]};
        testBed.component.show({reply});

        //focuses text editor
        expect(testBed.getChildComponent(TextEditorComponent).focus).toHaveBeenCalledTimes(1);

        //sets reply model on component instance
        expect(testBed.getChildComponent(TextEditorComponent).getContents()).toEqual(reply.body);
        expect(testBed.component.reply).toEqual(reply);

        //sets attachments on component instance
        expect(testBed.component.attachments).toEqual(reply.uploads);

        //copies attachments instead of using a reference
        expect(testBed.component.attachments).not.toBe(reply.uploads);

        //display modal in template
        expect(testBed.fixture.debugElement.nativeElement.classList.contains('hidden')).toEqual(false);
    });

    it('closes the modal', fakeAsync(() => {
        spyOn(testBed.getChildComponent(TextEditorComponent), 'destroyEditor');

        let onCloseFired = false;
        testBed.component.onClose.subscribe(() => onCloseFired = true);

        //close modal
        testBed.component.close();
        tick(201);

        //closes modal
        expect(onCloseFired).toEqual(true);

        //destroys text editor instance
        expect(testBed.getChildComponent(TextEditorComponent).destroyEditor).toHaveBeenCalled();
    }));

    it('updates reply', () => {
        testBed.fixture.detectChanges();

        spyOn(testBed.get(TicketsService), 'updateReply').and.returnValue(new BehaviorSubject({data: 'response-from-backend'}));

        testBed.component.reply = {id: 1, ticket_id: 2, type: 'replies'};
        testBed.getChildComponent(TextEditorComponent).setContents('reply body');
        testBed.component.attachments = [{file_name: 8}, {file_name: 9}];
        testBed.component.errors = true;

        //subscribe to onDone event
        let onDoneFired: any = false;
        testBed.component.onDone.subscribe(data => onDoneFired = data);

        testBed.component.confirm();

        //calls backend to update reply
        expect(testBed.get(TicketsService).updateReply).toHaveBeenCalledWith(1, {
            body: 'reply body', attachments: [8, 9]
        });

        //fires "onDone" event
        expect(onDoneFired).toEqual('response-from-backend');

        //erases previous errors
        expect(testBed.component.errors).toEqual({});
    });

    it('sets errors returned from backend on component instance', () => {
        testBed.component.reply = {};
        spyOn(testBed.get(TicketsService), 'updateReply').and.returnValue(Observable.throw({messages: {foo: 'bar'}}));
        testBed.component.confirm();
        expect(testBed.component.errors).toEqual({foo: 'bar'});
    });

    it('uploads files to backend', () => {
        let file1 = {name: 'foo', mime: 'bar'}; let file2 = {name: 'baz', mime: 'bar'};
        testBed.component.attachments = [file1];

        spyOn(testBed.get(UploadsService), 'uploadFiles').and.returnValue(new BehaviorSubject({data: [file2]}));

        testBed.component.uploadFiles([file2]);

        //calls backend to upload file
        expect(testBed.get(UploadsService).uploadFiles).toHaveBeenCalledWith([file2]);

        //concatenates returned files to to existing attachments
        expect(testBed.component.attachments).toEqual([file1, file2]);

        //binds attachments to "AttachmentsListComponent"
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual([file1, file2]);
    });

    it('removes an attachment', () => {
        let file1 = {name: 'foo', mime: 'bar', id: 1}; let file2 = {name: 'bar', mime: 'baz', id: 2};
        testBed.component.attachments = [file1, file2];
        testBed.fixture.detectChanges();

        testBed.component.removeAttachment(1);

        //removed attachment from component instance
        expect(testBed.component.attachments).toEqual([file2]);

        //removed attachments from attachments list
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual([file2]);
    });

    it('binds buttons properly', () => {
        spyOn(testBed.component, 'close');
        spyOn(testBed.component, 'confirm');

        //closes modal via top button
        testBed.find('.close-button').click();
        expect(testBed.component.close).toHaveBeenCalledTimes(1);

        //confirms modal action
        testBed.find('.submit-button').click();
        expect(testBed.component.confirm).toHaveBeenCalledTimes(1);

        //closes modal via top button
        testBed.find('.cancel-button').click();
        expect(testBed.component.close).toHaveBeenCalledTimes(2);
    });

    it('displays errors returned from backend', () => {
        testBed.component.errors = {body: 'body error', attachments: 'attachments error'};
        testBed.fixture.detectChanges();

        expect(testBed.findAll('.error')[0].textContent).toEqual('body error');
        expect(testBed.findAll('.error')[1].textContent).toEqual('attachments error');
    });

    it('binds text editor and attachments', () => {
        testBed.fixture.detectChanges();

        //binds minHeight
        expect(testBed.getChildComponent(TextEditorComponent).minHeight).toEqual(300);

        //binds to "onFileUpload" event
        spyOn(testBed.component, 'uploadFiles');
        testBed.getChildComponent(TextEditorComponent).onFileUpload.emit('list of files');
        expect(testBed.component.uploadFiles).toHaveBeenCalledWith('list of files');

        //renders upload progress bar component
        expect(testBed.getChildComponent(UploadProgressBar)).toBeTruthy();

        //hides attachments list if there are no attachments
        expect(testBed.getChildComponent(AttachmentsListComponent)).toBeFalsy();

        //binds current attachments to attachments list
        testBed.component.attachments = [{mime: 'foo'}, {mime: 'bar'}];
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual([{mime: 'foo'}, {mime: 'bar'}]);

        //binds to "onRemoveAttachment" event
        spyOn(testBed.component, 'removeAttachment');
        testBed.getChildComponent(AttachmentsListComponent).onRemoveAttachment.emit('attachment');
        expect(testBed.component.removeAttachment).toHaveBeenCalledWith('attachment');
    });
});
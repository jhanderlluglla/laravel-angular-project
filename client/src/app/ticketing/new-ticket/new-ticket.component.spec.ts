import {KarmaTest} from "../../../../testing/karma-test";
import {NewTicketComponent} from "./new-ticket.component";
import {TicketsService} from "../tickets.service";
import {UploadsService} from "../../shared/uploads.service";
import {SuggestedArticlesDrawerComponent} from "../suggested-articles-drawer/suggested-articles-drawer.component";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {UploadProgressBar} from "../../shared/upload-progress-bar/upload-progress-bar.component";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {FileValidator} from "../../shared/file-validator";
import {fakeAsync, tick} from "@angular/core/testing";
import {BehaviorSubject, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {HcUrls} from "../../help-center/shared/hc-urls.service";
import {HelpCenterService} from "../../help-center/shared/help-center.service";
import {ActivatedRouteStub} from "../../../../testing/stubs/activated-route-stub";
import {LoadingIndicatorComponent} from "../../shared/loading-indicator/loading-indicator.component";

describe('NewTicketComponent', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    NewTicketComponent, SuggestedArticlesDrawerComponent, AttachmentsListComponent,
                    UploadProgressBar, TextEditorComponent, LoadingIndicatorComponent,
                ],
                providers: [TicketsService, UploadsService, FileValidator, HcUrls, HelpCenterService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
            },
            component: NewTicketComponent
        });

        testBed.get(ActivatedRoute)['testData'] = {categories: testBed.fake('Tag', 2)};
    });

    it('sets available category tags during init', fakeAsync(() => {
        let tags = [{name: 'foo'}, {name: 'bar'}];
        testBed.get(ActivatedRoute)['testData'] = {categories: tags};

        testBed.fixture.detectChanges();
        tick();

        //sets all category tags on component instance
        expect(testBed.component.ticketCategories).toEqual(tags);

        //sets first available tag on new ticket model
        expect(testBed.component.ticketModel.category).toEqual(tags[0]);
    }));

    it('creates a new ticket', () => {
        spyOn(testBed.get(TicketsService), 'create').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(Router), 'navigate');
        testBed.component.ticketModel = {subject: 'foo', body: 'bar', category: {id: 1}};
        testBed.component.attachments = [{name: 'baz', file_name: 'abc'}, {mime: 'qux', file_name: 'efg'}];

        testBed.component.createTicket();

        //makes call to backend with correct params
        expect(testBed.get(TicketsService).create).toHaveBeenCalledWith({
            subject: testBed.component.ticketModel.subject,
            body: testBed.component.ticketModel.body,
            category: testBed.component.ticketModel.category.id,
            uploads: ['abc', 'efg'],
        });

        //navigates to customer tickets route on success
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(testBed.get(HcUrls).getCustomerTicketsListLink());
    });

    it('shows errors if ticket creation fails', () => {
        testBed.component.ticketModel.category = {id: 1};
        spyOn(testBed.get(TicketsService), 'create').and.returnValue(Observable.throw({messages: {subject: 'foo'}}));
        spyOn(testBed.get(Router), 'navigate');

        testBed.component.createTicket();

        //does not navigate to customer tickets route on failure
        expect(testBed.get(Router).navigate).not.toHaveBeenCalled();

        //sets errors on component instance
        expect(testBed.component.errors).toEqual({subject: 'foo'});
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

    it('removes attachment from ticket', () => {
        testBed.component.attachments = [{id: 1}, {id: 2}];

        testBed.component.removeAttachment(1);

        expect(testBed.component.attachments).toEqual([{id: 2}]);
    });

    it('renders and binds new ticket form', fakeAsync(() => {
        let tags = [{name: 'foo'}, {name: 'bar'}];
        testBed.get(ActivatedRoute)['testData'] = {categories: tags};
        spyOn(testBed.component, 'createTicket');
        testBed.component.errors = {category: 'category error', subject: 'subject error', body: 'body error'};
        testBed.fixture.detectChanges();

        //renders category select input
        tick();
        testBed.fixture.detectChanges();
        expect(testBed.findAll('#category-select > option').length).toEqual(2);
        expect(testBed.find('#category-select > option')['value']).toEqual('0: Object');
        expect(testBed.find('#category-select > option').textContent).toEqual(testBed.component.ticketCategories[0]['name']);
        expect(testBed.find('.category-error').textContent.trim()).toEqual(testBed.component.errors.category);

        //renders ticket subject input
        testBed.getChildComponent(SuggestedArticlesDrawerComponent).inputValue.emit('foo bar');
        expect(testBed.component.ticketModel.subject).toEqual('foo bar');
        expect(testBed.find('.subject-error').textContent.trim()).toEqual(testBed.component.errors.subject);

        //renders ticket body input
        spyOn(testBed.component, 'uploadFiles');
        testBed.getChildComponent(TextEditorComponent).onFileUpload.emit('files');
        testBed.getChildComponent(TextEditorComponent).onChange.emit('content');
        expect(testBed.component.uploadFiles).toHaveBeenCalledWith('files');
        expect(testBed.component.ticketModel.body).toEqual('content');
        expect(testBed.find('.body-error').textContent.trim()).toEqual(testBed.component.errors.body);

        //does not render attachments list if there are no attachments
        expect(testBed.getChildComponent(AttachmentsListComponent)).toBeFalsy();

        //renders attachment list
        testBed.component.attachments = [{id: 3, mime: 'baz'}, {id: 4, mime: 'qux'}];
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual(testBed.component.attachments);
        spyOn(testBed.component, 'removeAttachment');
        testBed.getChildComponent(AttachmentsListComponent).onRemoveAttachment.emit('attachments');
        expect(testBed.component.removeAttachment).toHaveBeenCalledWith('attachments');

        //creates new ticket
        testBed.find('.submit-button').click();
        expect(testBed.component.createTicket).toHaveBeenCalledTimes(1);
    }));
});
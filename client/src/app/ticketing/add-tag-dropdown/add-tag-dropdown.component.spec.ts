import {KarmaTest} from "../../../../testing/karma-test";
import {AddTagDropdownComponent} from "./add-tag-dropdown.component";
import {TagService} from "../../shared/tag.service";
import {TicketsService} from "../tickets.service";
import {BehaviorSubject} from "rxjs";
import {fakeAsync, tick} from "@angular/core/testing";
import {ToastService} from "../../shared/toast/toast.service";

describe('AddTagDropdown', () => {

    let testBed: KarmaTest<any>;
    let tags = [{name: 'foo'}, {name: 'bar'}];

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [AddTagDropdownComponent],
                providers: [TicketsService, TagService],
            },
            component: AddTagDropdownComponent
        });

        testBed.logInAsAdmin();
    });

    it('searches existing tags', fakeAsync(() => {
        testBed.fixture.detectChanges();
        let query = 'foo bar';
        spyOn(testBed.get(TagService), 'search').and.returnValue(new BehaviorSubject({data: tags}));

        //type into tag search input element
        testBed.typeIntoEl('.tag-search-input', query);
        tick(301);

        //assert call was made to backend to search for tags
        expect(testBed.get(TagService).search).toHaveBeenCalledWith(query);

        //assert tags returned by backend were set on component instance
        expect(testBed.component.tags).toEqual(tags);
    }));

    it('renders tags returned from backend', () => {
        testBed.component.tags = tags;
        testBed.fixture.detectChanges();

        //assert two tags were rendered
        expect(testBed.findAll('.tags > .tag').length).toEqual(2);

        //assert tag name was rendered properly
        expect(testBed.find('.tags > .tag').textContent).toEqual(tags[0].name);
    });

    it('adds tag to ticket', () => {
        //set up component instance
        testBed.component.tags = tags;
        testBed.component.ticketIds = [1, 2, 3];
        testBed.fixture.detectChanges();

        //fake addTag backend call
        spyOn(testBed.get(TicketsService), 'addTag').and.returnValue(new BehaviorSubject(true));
        spyOn(testBed.get(ToastService), 'show');

        //subscribe to "onTagAdded" event
        let onTagAddedFired = false;
        testBed.component.onTagAdded.subscribe(() => onTagAddedFired = true);

        //click on the first tag
        testBed.find('.tags > .tag').click();

        //assert call was made to backend to add tag to tickets
        expect(testBed.get(TicketsService).addTag).toHaveBeenCalledWith(tags[0].name, testBed.component.ticketIds);
        expect(testBed.get(ToastService).show).toHaveBeenCalled();

        //assert "onTagAdded" event was fired
        expect(onTagAddedFired).toEqual(true);
    });
});
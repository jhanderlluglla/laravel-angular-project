import {KarmaTest} from "../../../../../testing/karma-test";
import {TagService} from "../../../shared/tag.service";
import {BehaviorSubject} from "rxjs";
import {TagsManagerComponent} from "./tags-manager.component";

describe('TagsManager', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [TagsManagerComponent],
                providers: [TagService],
            },
            component: TagsManagerComponent,
        });
    });

    it('fetches tags on component init', () => {
        spyOn(testBed.get(TagService), 'getTags').and.returnValue(new BehaviorSubject({data: [{id: 1, type: 'status'}, {id: 2}, {id: 3}]}));

        testBed.fixture.detectChanges();

        //calls backend to fetch all tags
        expect(testBed.get(TagService).getTags).toHaveBeenCalledTimes(1);

        //filters out tags with type "status"
        expect(testBed.component.existingTags).toEqual([{id: 2}, {id: 3}]);
    });

    it('returns a copy of selected tags', () => {
        testBed.component.selectedTags = [1, 2, 3];

        let tags = testBed.component.getSelectedTags();

        //gets tags
        expect(tags).toEqual(testBed.component.selectedTags);

        //copies tags instead of returning a reference
        expect(tags).not.toBe(testBed.component.selectedTags);
    });

    it('sets selected tags', () => {
        expect(testBed.component.selectedTags).toEqual([]);
        testBed.component.setSelectedTags(['foo', 'bar']);
        expect(testBed.component.selectedTags).toEqual(['foo', 'bar']);
    });

    it('adds tags from specified string', () => {
        testBed.component.tagsString = 'bar, baz, qux';
        testBed.component.selectedTags = ['foo'];

        testBed.component.addTags('bar, baz, qux');

        //sets selected tags
        expect(testBed.component.selectedTags).toEqual(['foo', 'bar', 'baz', 'qux']);

        //clear tags string model
        expect(testBed.component.tagsString).toEqual('');

        //does not throw error if specified tags are invalid
        testBed.component.addTags('');
    });

    it('adds tag to selected tags array', () => {
        testBed.component.selectedTags = ['foo', 'bar'];

        //adds tag
        testBed.component.addTag('baz');
        expect(testBed.component.selectedTags).toEqual(['foo', 'bar', 'baz']);

        //does not add tag if it already is added
        testBed.component.addTag('foo');
        expect(testBed.component.selectedTags.length).toEqual(3);
        expect(testBed.component.selectedTags).toEqual(['foo', 'bar', 'baz']);
    });

    it('renders and binds component template', () => {
        testBed.fixture.detectChanges();

        //renders tags input field
        testBed.typeIntoEl('.tags-string-model', 'foo, bar');
        expect(testBed.component.tagsString).toEqual('foo, bar');

        //renders add tags button
        spyOn(testBed.component, 'addTags');
        testBed.find('.add-tags-button').click();
        expect(testBed.component.addTags).toHaveBeenCalledWith('foo, bar');

        //renders selected tags
        testBed.component.selectedTags = ['foo', 'bar'];
        testBed.fixture.detectChanges();
        let tags1 = testBed.findAll('.selected-tags .tag-name');
        expect(tags1.length).toEqual(2);
        expect(tags1[0].textContent.trim()).toEqual('foo');

        //renders existing tags
        testBed.component.existingTags = [{name: 'bar'}, {name: 'qux'}];
        testBed.fixture.detectChanges();
        let tags2 = testBed.findAll('.existing-tags .tag-name');
        expect(tags2.length).toEqual(2);
        expect(tags2[0].textContent.trim()).toEqual('bar');

        //adds tag when clicking on existing tag name
        spyOn(testBed.component, 'addTag');
        tags2[0].click();
        expect(testBed.component.addTag).toHaveBeenCalledWith('bar');
    });
});
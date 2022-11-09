import {KarmaTest} from "../../../../../testing/karma-test";
import {CategoryModalComponent} from "./category-modal.component";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {fakeAsync, tick} from "@angular/core/testing";
import {Observable} from "rxjs/Observable";
import {CategoriesService} from "../../shared/categories.service";

describe('CategoryModalComponent', () => {
    let testBed: KarmaTest<CategoryModalComponent>;

    beforeEach(() => {
        testBed = new KarmaTest<CategoryModalComponent>({
            module: {
                declarations: [
                    CategoryModalComponent,
                ],
                providers: [CategoriesService],
            },
            component: CategoryModalComponent,
        });
    });

    it('shows the modal', () => {
        let category = testBed.fake('Category');
        let categories = testBed.fake('Category', 2);
        spyOn(testBed.get(CategoriesService), 'getCategories').and.returnValue(new BehaviorSubject(categories));

        //modal is set to 'creating' by default
        expect(testBed.component.updating).toEqual(false);

        testBed.component.show({category: category});

        //fetches all categories
        expect(testBed.get(CategoriesService).getCategories).toHaveBeenCalledTimes(1);

        //sets all categories on component
        expect(testBed.component.categories).toEqual(categories);

        //sets category that is being updated if any is specified
        expect(testBed.component.model).toEqual(category);
        expect(testBed.component.updating).toEqual(true);
    });

    it('sets "parent_id" on model, if "parent_id" is specified', () => {
        testBed.component.show({parentId: 1});

        //sets parentId
        expect(testBed.component.model.parent_id).toEqual(1);

        //does not set 'updating', if no category is specified
        expect(testBed.component.updating).toEqual(false);
    });

    it('creates or updates category on confirm', fakeAsync(() => {
        let updated = testBed.fake('Category');
        testBed.component.categories = testBed.fake('Category', 2);
        let onDoneFired = false;
        testBed.component.onDone.subscribe(data => onDoneFired = data);
        spyOn(testBed.get(CategoriesService), 'createOrUpdateCategory').and.returnValue(new BehaviorSubject(updated));
        testBed.fixture.detectChanges();
        tick();

        //selects "no category" select option by default
        expect(testBed.find('#parent_id')['options']['selectedIndex']).toEqual(0);
        expect(testBed.find('#parent_id')['options'][0].textContent.trim()).toEqual(jasmine.any(String));

        testBed.component.model = testBed.fake('Category');
        testBed.typeIntoEl('#name', 'foo');
        testBed.typeIntoEl('#description', 'bar');
        testBed.chooseSelectValue('#parent_id', ''+testBed.component.categories[0].id);

        testBed.find('.submit-button').click();
        tick(201);

        //updates category
        expect(testBed.get(CategoriesService).createOrUpdateCategory).toHaveBeenCalledWith({
            id: testBed.component.model.id,
            name: 'foo',
            description: 'bar',
            parent_id: ''+testBed.component.categories[0].id,
        });

        //fires event with category returned from backend
        expect(onDoneFired).toEqual(updated);
    }));

    it('shows errors', () => {
        let errors = {name: 'foo', description: 'bar', parent_id: 'baz'};
        spyOn(testBed.get(CategoriesService), 'createOrUpdateCategory').and.returnValue(Observable.throw({messages: errors}));

        testBed.component.confirm();
        testBed.fixture.detectChanges();

        expect(testBed.find('.name-error').textContent.trim()).toEqual(errors.name);
        expect(testBed.find('.description-error').textContent.trim()).toEqual(errors.description);
        expect(testBed.find('.parent-error').textContent.trim()).toEqual(errors.parent_id);
    });
});
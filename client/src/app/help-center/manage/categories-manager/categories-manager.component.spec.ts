import {KarmaTest} from "../../../../../testing/karma-test";
import {CategoriesManagerComponent} from "./categories-manager.component";
import {BehaviorSubject} from "rxjs";
import {HelpCenterService} from "../../shared/help-center.service";
import {fakeAsync, tick} from "@angular/core/testing";
import {CategoriesService} from "../../shared/categories.service";

describe('CategoriesManager', () => {

    let testBed: KarmaTest<CategoriesManagerComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [CategoriesManagerComponent],
                providers: [HelpCenterService, CategoriesService],
            },
            component: CategoriesManagerComponent,
        });
    });

    it('gets and sets selected categories', () => {
        let categories = testBed.fake('Category', 2);
        testBed.component.selectedCategories = categories;
        expect(testBed.component.getSelectedCategories()).toEqual(categories);
    });

    it('refreshes categories', () => {
        const categories = testBed.fake('Category', 2);
        spyOn(testBed.get(CategoriesService), 'getCategories').and.returnValue(new BehaviorSubject(categories));
        testBed.component.refresh();

        //calls backend
        expect(testBed.get(CategoriesService).getCategories).toHaveBeenCalledTimes(1);

        //sets categories
        expect(testBed.component.categories).toEqual(categories);
    });

    it('inits component', fakeAsync(() => {
        spyOn(testBed.component, 'refresh');
        testBed.fixture.detectChanges();
        testBed.component.allCategories = testBed.fake('Category', 2);

        testBed.typeIntoEl('#categories-manager-search', testBed.component.allCategories[0].name);
        tick(401);

        //filters categories
        expect(testBed.component.categories).toEqual([testBed.component.allCategories[0]]);

        //fetches initial categories
        expect(testBed.component.refresh).toHaveBeenCalledTimes(1);
    }));

    it('toggles categories', () => {
        let eventFired; let category = testBed.fake('Category');
        testBed.component.onChange.subscribe(() => eventFired = true);
        testBed.component.selectedCategories = [];

        testBed.component.toggle(category, 2);

        //selects category and parent
        expect(testBed.component.selectedCategories).toEqual([category.id, 2]);

        //fires "onChange" event
        expect(eventFired).toBeTruthy();
    });

    it('gets exact selected categories', () => {
        let categories = [testBed.fake('Category', 1, {children: [testBed.fake('Category')]}), testBed.fake('Category')];
        testBed.component.selectedCategories = [categories[0].id, categories[0].children[0].id];
        testBed.component.categories = categories;

        //does not return parent category id, if it's child is selected
        expect(testBed.component.getExactSelectedCategories()).toEqual([categories[0].children[0].id]);
    });

    it('renders categories panel', () => {
        testBed.component.categories = [testBed.fake('Category'), testBed.fake('Category', 1, {children: testBed.fake('Category', 2)})];
        testBed.fixture.detectChanges();
        let parentCategories = testBed.findAll('.parent-category > input');
        let childCategories  = testBed.findAll('.child-category > input');

        //renders parent and child categories
        expect(parentCategories.length).toEqual(2);
        expect(childCategories.length).toEqual(2);

        //checks parent category if it is selected
        testBed.component.selectedCategories = [testBed.component.categories[0].id];
        testBed.fixture.detectChanges();
        expect(parentCategories[0]['checked']).toEqual(true);

        //checks parent category if any of its children are selected
        testBed.component.selectedCategories = [testBed.component.categories[1].children[0].id];
        testBed.fixture.detectChanges();
        expect(parentCategories[0]['checked']).toEqual(false);
        expect(parentCategories[1]['checked']).toEqual(true);

        //toggles parent category on click
        testBed.component.selectedCategories = [9];
        testBed.toggleCheckbox('.parent-category > input');
        expect(testBed.component.selectedCategories).toEqual([9, testBed.component.categories[0].id]);

        //renders parent category name
        expect(testBed.find('.parent-category > label').textContent).toEqual(testBed.component.categories[0].name);

        //checks child category if it is selected
        testBed.component.selectedCategories = [testBed.component.categories[1].children[0].id];
        testBed.fixture.detectChanges();
        expect(childCategories[0]['checked']).toEqual(true);

        //toggles child (and selects parent) category on click
        testBed.component.selectedCategories = [9];
        testBed.toggleCheckbox('.child-category > input');
        expect(testBed.component.selectedCategories).toEqual([9, testBed.component.categories[1].children[0].id, testBed.component.categories[1].id]);

        //renders child category name
        expect(testBed.find('.child-category > label').textContent).toEqual(testBed.component.categories[1].children[0].name);
    })
});
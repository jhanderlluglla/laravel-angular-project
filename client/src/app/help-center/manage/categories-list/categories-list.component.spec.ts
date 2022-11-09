import {KarmaTest} from "../../../../../testing/karma-test";
import {ModalService} from "../../../shared/modal/modal.service";
import {BehaviorSubject, Observer, Observable} from "rxjs";
import {tick, fakeAsync} from "@angular/core/testing";
import {CategoriesListComponent} from "./categories-list.component";
import {CategoryModalComponent} from "../category-modal/category-modal.component";
import {CategoryListItemComponent} from "./category-list-item/category-list-item.component";
import {CategoriesService} from "../../shared/categories.service";
import {HelpCenterService} from "../../shared/help-center.service";
import {ReorderDirective} from "../../../shared/reorder.directive";

describe('CategoriesList', () => {
    let testBed: KarmaTest<CategoriesListComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [CategoriesListComponent, CategoryListItemComponent, ReorderDirective],
                providers: [CategoriesService, HelpCenterService],
            },
            component: CategoriesListComponent,
        });
    });

    it('initiates component', fakeAsync(() => {
        spyOn(testBed.component, 'updateCategories');
        spyOn(testBed.component, 'bindSearchQuery' as any);
        testBed.fixture.detectChanges();
        expect(testBed.component.updateCategories).toHaveBeenCalledTimes(1);
        expect(testBed.component['bindSearchQuery']).toHaveBeenCalledTimes(1);
    }));

    it('opens category create/update modal', () => {
        let observer: Observer<any>;
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: Observable.create(o => observer = o)});
        spyOn(testBed.component, 'updateCategories');

        testBed.component.showNewCategoryModal();

        //opens modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(CategoryModalComponent);

        //does not reload categories if user does not update category
        expect(testBed.component.updateCategories).not.toHaveBeenCalled();

        //reloads categories if user update category
        observer.next(null);
        expect(testBed.component.updateCategories).toHaveBeenCalledTimes(1);
    });

    it('updates categories', () => {
        const categories = testBed.fake('Category', 2);
        spyOn(testBed.get(CategoriesService), 'getCategories').and.returnValue(new BehaviorSubject(categories));
        testBed.component.updateCategories();
        expect(testBed.get(CategoriesService).getCategories).toHaveBeenCalledTimes(1);
        expect(testBed.component.filteredCategories).toEqual(categories);
    });

    it('renders and binds search bar', fakeAsync(() => {
        testBed.fixture.detectChanges();
        testBed.component.allCategories = testBed.fake('Category', 2);

        testBed.typeIntoEl('.categories-search-input', testBed.component.allCategories[0].name);
        tick(401);

        //filters categories
        expect(testBed.component.filteredCategories).toEqual([testBed.component.allCategories[0]]);
    }));

    it('renders new category button', () => {
        spyOn(testBed.component, 'showNewCategoryModal');
        testBed.find('.new-category-button').click();
        expect(testBed.component.showNewCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('renders categories', () => {
        testBed.component.filteredCategories = [testBed.fake('Category', 1, {children: testBed.fake('Category', 2)}), testBed.fake('Category')];
        testBed.fixture.detectChanges();

        let items = testBed.findAllDebugEl('category-list-item');

        //renders both categories and their children
        expect(items.length).toEqual(4);

        //adds "has-children" class if category has children
        expect(items[0].nativeElement.classList.contains('has-children')).toBeTruthy();
        expect(items[3].nativeElement.classList.contains('has-children')).toBeFalsy();

        //renders children of second category
        expect(items[0].nativeElement.classList.contains('child-category')).toBeFalsy();
        expect(items[1].nativeElement.classList.contains('child-category')).toBeTruthy();
        expect(items[2].nativeElement.classList.contains('child-category')).toBeTruthy();

        //binds category to component
        expect(items[0].componentInstance.category).toEqual(testBed.component.filteredCategories[0]);
        expect(items[1].componentInstance.category).toEqual(testBed.component.filteredCategories[0].children[0]);

        //binds to "onChange" event
        spyOn(testBed.component, 'updateCategories');
        items[0].componentInstance.onChange.emit();
        expect(testBed.component.updateCategories).toHaveBeenCalledTimes(1);

        //renders "categoryId" attribute
        expect(items[0].attributes['uuid']).toEqual(''+testBed.component.filteredCategories[0]['id']);
    });
});
import {KarmaTest} from "../../../../testing/karma-test";
import {EmailAddressModalComponent} from "./email-address-modal.component";
import {fakeAsync, tick} from "@angular/core/testing";
import {UserService} from "../../admin/users/user.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

describe('EmailAddressModalComponent', () => {
    let testBed: KarmaTest<EmailAddressModalComponent>;

    beforeEach(() => {
        testBed = new KarmaTest<EmailAddressModalComponent>({
            module: {
                declarations: [
                    EmailAddressModalComponent
                ],
                providers: [UserService],
            },
            component: EmailAddressModalComponent
        });
    });

    it('returns submitted email address to caller', fakeAsync(() => {
        spyOn(testBed.get(UserService), 'addEmail').and.returnValue(new BehaviorSubject({}));
        let onDoneFired: any = false;
        testBed.component.show({userId: 1});
        testBed.component.onDone.subscribe(data => onDoneFired = data);
        testBed.fixture.detectChanges();
        tick(201);

        testBed.typeIntoEl('#email', 'foo@bar.com');
        testBed.find('.submit-button').click();
        tick(201);

        //adds email to user
        expect(testBed.get(UserService).addEmail).toHaveBeenCalledWith(1, {emails: ['foo@bar.com']});

        //returns added email address
        expect(onDoneFired).toEqual('foo@bar.com');
    }));
});

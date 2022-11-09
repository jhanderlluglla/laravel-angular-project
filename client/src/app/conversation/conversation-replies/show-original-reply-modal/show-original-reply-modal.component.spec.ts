import {KarmaTest} from "../../../../../testing/karma-test";
import {ShowOriginalReplyModalComponent} from "./show-original-reply-modal.component";

describe('ShowOriginalReplyModalTest', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ShowOriginalReplyModalComponent],
                providers: [],
            },
            component: ShowOriginalReplyModalComponent,
        });
    });

    it('shows original email content', ()=> {
        testBed.component.show({original: {body: {plain: 'foo', html: 'bar'}}});
        testBed.fixture.detectChanges();

        expect(testBed.find('.body-plain').textContent.trim()).toEqual('foo');
        expect(testBed.find('.body-html').textContent.trim()).toEqual('bar');
    });
});
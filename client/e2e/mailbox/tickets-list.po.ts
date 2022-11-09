import {$$} from 'protractor';

export class TicketsList {

    /**
     * Test if tickets are rendered properly.
     */
    static expectTicketsTobeRendered() {
        expect($$('tickets-list').last().$$('.ticket').count()).toBeGreaterThanOrEqualTo(2);
        expect($$('tickets-list').last().$$('.customer-name').get(1).getText()).toBeNonEmptyString();
        expect($$('tickets-list').last().$$('.ticket-subject').get(1).getText()).toBeNonEmptyString();
        expect($$('tickets-list').last().$$('.ticket-body').get(1).getText()).toBeNonEmptyString();
        expect($$('tickets-list').last().$$('.replies-count span').get(1).getText()).toBeNonEmptyString();
        expect($$('tickets-list').last().$$('.last-updated').get(1).getText()).toBeNonEmptyString();
        expect($$('tickets-list').last().$$('.ticket-number').get(1).getText()).toBeNonEmptyString();
        expect($$('tickets-list').last().$$('.avatar img').get(1).isDisplayed()).toBeTruthy();
    }

    /**
     * Select the first two tickets in the list.
     */
    static selectFirstTwoTickets() {
        $$('tickets-list').last().$$('.ticket-row label').get(0).click();
        $$('tickets-list').last().$$('.ticket-row label').get(1).click();
    }

    /**
     * Test if all tickets are deselected and floating toolbar is closed.
     */
    static expectTicketsToBeDeselectedAndToolbarClosed() {
        expect($$('tickets-list').last().$$('.ticket input').get(1).isSelected()).toBeFalse();
        expect($$('tickets-list').last().$('ticket-floating-toolbar').getAttribute('class')).toContain('hidden');
    }

    /**
     * Assign selected tickets to currently logged in agent.
     */
    static assignSelectedTicketsToCurrentAgent() {
        $$('tickets-list').last().$('assign-ticket-dropdown').click();
        $$('tickets-list').last().$('assign-ticket-dropdown .me-item').click();
    }
}

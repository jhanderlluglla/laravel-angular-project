import { Injectable }             from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Conversation} from "./conversation.service";
import {TicketsService} from "../ticketing/tickets.service";
import {Ticket} from "../shared/models/Ticket";

@Injectable()
export class TicketResolve implements Resolve<Ticket> {

    constructor(private tickets: TicketsService, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Ticket> {
        let ticketId = route.params['ticket_id'] || route.params['id'];

        return this.tickets.get(ticketId).toPromise().then(ticket => {
            return ticket;
        }, () => {
            this.router.navigate(['/help-center/tickets']);
            return false;
        });
    }
}
import { Injectable }             from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {TicketsService} from "../../ticketing/tickets.service";
import {Ticket} from "../../shared/models/Ticket";

@Injectable()
export class TicketsResolve implements Resolve<Ticket[]> {

    constructor(private tickets: TicketsService, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Promise<any> {
        return this.tickets.getTickets({}).toPromise().then(response => {
            return response.data.map(ticket => {
                if (!ticket.tags.find(tag => tag.name.toLowerCase() == 'agent created') && !ticket.tags.find(tag => tag.name.toLowerCase() == 'email')) {
                    ticket.tags.push({
                    	id: 10,
                        type: 'default',
                        name: 'Email',
                        display_name: 'Email'
                    });
                }
                return ticket;
            });
        }, () => {
            this.router.navigate(['/admin/tickets']);
            return false;
        });
    }
}
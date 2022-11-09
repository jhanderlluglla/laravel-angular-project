import {Injectable} from '@angular/core';
import {HttpClient} from "../../shared/http-client";

@Injectable()
export class ReportsService {

    constructor(private httpClient: HttpClient) {}

    /**
     * Get envato earnings for given perdiod.
     */
    public getEnvatoEarnings(filters = null) {
        return this.httpClient.get('reports/envato/earnings', filters);
    }

    /**
     * Get ticket counts for each day in given month.
     */
    public getTicketCountsForMonth(month, year = null) {
        let payload: any = {from_month: month};
        if (year) payload.year = year;

        return this.httpClient.get('reports/tickets/count/daily', payload);
    }

    /**
     * Get report on tickets for given time range.
     */
    public getTicketsReportForRange(params = null) {
        return this.httpClient.get('reports/tickets/range', params);
    }
}
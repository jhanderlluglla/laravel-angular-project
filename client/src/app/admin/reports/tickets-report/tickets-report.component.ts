import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TicketsCountChartComponent} from "./tickets-count-chart/tickets-count-chart";
import {TicketsByTagsChartComponent} from "./tickets-by-tags-chart/tickets-by-tag-chart";
import {FirstResponseByHoursChartComponent} from "./first-response-by-hours-chart/first-response-by-hours-chart";
import {TicketsByHourChartComponent} from "./tickets-by-hour-chart/tickets-by-hour-chart.component";
import * as moment from 'moment';
import {ReportsService} from "../reports.service";

@Component({
    selector: 'tickets-report',
    templateUrl: './tickets-report.component.html',
    styleUrls: ['./tickets-report.component.scss'],
    providers: [ReportsService],
    encapsulation: ViewEncapsulation.None,
})

export class TicketsReportComponent implements OnInit {
    @ViewChild(TicketsCountChartComponent) ticketsCountChart: TicketsCountChartComponent;
    @ViewChild(TicketsByTagsChartComponent) ticketsByTagsChart: TicketsByTagsChartComponent;
    @ViewChild(FirstResponseByHoursChartComponent) firstResponseByHourChart: FirstResponseByHoursChartComponent;
    @ViewChild(TicketsByHourChartComponent) ticketsByHourChart: TicketsByHourChartComponent;

    /**
     * Indicates if report is being loaded currently.
     */
    public isLoading = false;

    /**
     * Date range for which report should be generated.
     */
    public dateRange: any = {
        primary: {},
        compare: {},
    };

    public reportData: any = {
        primary: {},
        compare: {},
    };

    constructor(private reports: ReportsService) {}

    ngOnInit() {
        this.setFiltersFromReadableString('last_30_days', 'primary');
        this.setFiltersFromReadableString('previous_period', 'compare');
        this.refreshReport('primary');
    }

    /**
     * Refresh report using current date range filters.
     */
    public refreshReport(dataType = 'primary') {
        this.isLoading = true;

        this.reports.getTicketsReportForRange(this.getDateRangeObject(dataType)).subscribe(response => {
            this.reportData[dataType] = response.data;

            this.ticketsCountChart.refresh(this.reportData.primary.dailyCounts, this.reportData.compare.dailyCounts);
            this.ticketsByTagsChart.refresh(this.reportData.primary.tags, this.reportData.compare.tags);
            this.firstResponseByHourChart.refresh(
                this.reportData.primary.firstResponseTimes.breakdown,
                this.reportData.compare.firstResponseTimes ? this.reportData.compare.firstResponseTimes.breakdown : null,
            );
            this.ticketsByHourChart.refresh(this.reportData.primary.hourlyCounts);

            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }

    /**
     * Clear compare data and refresh all charts.
     */
    public clearCompareData() {
        this.reportData.compare = {};
        this.refreshReport();
    }

    /**
     * Update date range from human readable string.
     */
    public setFiltersFromReadableString(string, dataType = 'primary', momentInstance = null) {
        this.dateRange[dataType].period = string;

        if (string === 'custom') return;

        let range;

        let momentFrom = momentInstance ? momentInstance.clone() : moment();
        let momentTo   = momentInstance ? momentInstance.clone() : moment();

        if (string === 'previous_period') {
            return this.setFiltersFromReadableString(
                this.dateRange.primary.period,
                'compare',
                moment(this.dateRange.primary.from)
            );
        }

        switch(string) {
            case 'last_7_days':
                range = momentFrom.subtract(7, 'days');
                break;
            case 'today':
                range = momentFrom.startOf('day');
                break;
            case 'last_week':
                range = momentFrom.subtract(1, 'week');
                break;
            case 'last_month':
                range = momentFrom.subtract(1, 'month');
                break;
            default:
                range = momentFrom.subtract(30, 'days');
        }

        this.dateRange[dataType].from = range.format('YYYY-MM-DD');
        this.dateRange[dataType].to = momentTo.format('YYYY-MM-DD');
    }

    /**
     * Update date range from javascript date time string.
     */
    public setFiltersFromDateString(string, type = 'from', dataType = 'primary') {
        let m = moment(string);
        this.dateRange[dataType][type] = m.format('YYYY-MM-DD');
    }

    private getDateRangeObject(dataType = 'primary') {
        let from = moment(this.dateRange[dataType].from),
            to   = moment(this.dateRange[dataType].to);

        return {
            from_year: from.year(),
            from_month: from.month() + 1,
            from_day: from.date(),
            to_year: to.year(),
            to_month: to.month() + 1,
            to_day: to.date(),
        };
    }
}

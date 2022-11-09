import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ReportsService} from "./../reports.service";
import * as moment from 'moment';

@Component({
    selector: 'envato-reports',
    templateUrl: './envato-reports.component.html',
    styleUrls: ['./envato-reports.component.scss'],
    providers: [ReportsService],
    encapsulation: ViewEncapsulation.None,
})

export class EnvatoReportsComponent implements OnInit {

    /**
     * Currently active left panel tab
     */
    public activeTab = 'earnings';

    /**
     * Currently selected time period for envato reports.
     */
    public selectedPeriod = 'month';

    /**
     * Date filters for main dataset.
     */
    public filters: any = {};

    /**
     * Filters for compare chart dataset.
     */
    public compareFilters: {year?: number, month?: number, day?: number, to_day?: number} = {};

    /**
     * Names of all months.
     */
    public months: string[] = [];

    /**
     * Active chart instance.
     */
    public activeChart: any;

    /**
     * True if we're fetching chart data from server currently.
     */
    public chartStatus = {loading: false};

    constructor(private reports: ReportsService) {}

    ngOnInit() {
        this.resetFilters();
        this.refreshActiveChart();
        this.months = moment.months();
    }

    /**
     * Trigger change detection for filters object,
     * needed in order for chart directives to update properly.
     */
    public refreshActiveChart(withCompare = false) {
        if (this.chartStatus.loading || ! this.activeChart) return;
        this.activeChart.refresh(this.filters, withCompare ? this.compareFilters : null);
    }

    /**
     * Set active chart component instance.
     */
    public setActiveChartInstance(instance) {
        this.activeChart = instance;
        this.refreshActiveChart();
    }

    /**
     * Filter earnings by specific item.
     */
    public showEarningsForItem(itemId) {
        this.filters['envato_item_id'] = itemId;
        this.refreshActiveChart();
    }

    /**
     * Stop filtering earnings by specific item.
     */
    public stopFilteringByItem() {
        delete this.filters.envato_item_id;
        this.refreshActiveChart();
    }

    /**
     * Show envato earnings for week or month.
     */
    public showEarningsFor(period = 'week', keepChart = false) {
        if (this.chartStatus.loading) return;
        if ( ! keepChart) this.activeChart = null;
        this.selectedPeriod = period;

        let now = moment();

        period = period === 'week' ? 'isoWeek' : 'month';

        this.filters = {
            year: now.year(),
            month: now.month() + 1,
            day: now.startOf(<any>period).date(),
            to_day: now.endOf(<any>period).date(),
        };

        //TODO: refactor this
        let id = setInterval(() => {
            if (this.activeChart) {
                this.refreshActiveChart();
                clearInterval(id);
            }
        }, 50)
    }

    /**
     * Update filters object from given date string.
     */
    public updateFiltersFromDate(date: string, type = null) {
        let m = moment(date);

        let filters = {
            year: m.year(),
            month: m.month() + 1,
            day:  m.date(),
            to_day: m.endOf('month').date(),
        };

        if (type === 'compare') {
            this.compareFilters = filters;
        } else {
            this.filters = filters;
        }
    }

    /**
     * Reset date filters to default values.
     */
    private resetFilters() {
        let now = moment();

        let currentYear  = now.year();
        let currentMonth = now.month() + 1;
        let lastOfMonth  = now.endOf('month').date();
        let compareLastOfMonth = now.subtract(1, 'months').endOf('month').date();

        this.filters = {year: currentYear, month: currentMonth, day: 1, to_day: lastOfMonth};
        this.compareFilters = {year: currentYear, month: currentMonth - 1, day: 1, to_day: compareLastOfMonth};
    }

    /**
     * Get array of days in a given month.
     */
    public getDaysInMonth(year, month, startFrom = null): number[] {
        let daysInMonth = new Date(year, month, 0).getDate();

        let days = [];
        for (var i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        if (startFrom) {
            days.splice(0, startFrom);
        }

        return days;
    }
}

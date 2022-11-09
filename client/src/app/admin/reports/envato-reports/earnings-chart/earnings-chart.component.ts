import {Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {ReportsService} from "../../reports.service";
import * as Chart from 'chart.js'

@Component({
    selector: 'earnings-chart',
    template: '<canvas id="earnings-chart" #canvas></canvas>',
    encapsulation: ViewEncapsulation.None,
})
export class EarningsChartComponent implements OnInit, OnDestroy {
    @ViewChild('canvas') canvas: ElementRef;

    /**
     * Indicates if any charts are currently loading data from server.
     */
    @Input() chartStatus: any;

    @Output() onInit = new EventEmitter();

    /**
     * Data for charts.
     */
    public data;

    /**
     * Chart.js instance.
     */
    private ChartInstance;

    /**
     * Chart styles for primary dataset.
     */
    private primaryDatasetStyles = {
        backgroundColor: "hsla(91, 75%, 41%, 0.2)",
        borderColor: "hsla(91, 75%, 41%, 1)",
        borderWidth: 2,
        tension: 0,
        pointBackgroundColor: "hsla(91, 75%, 41%, 1)",
    };

    /**
     * Chart styles for secondary dataset.
     */
    private secondaryDatasetStyles = {
        backgroundColor: "rgba(151,187,205,0.2)",
        borderColor: "rgba(151,187,205,0.4)",
        borderWidth: 2,
        tension: 0,
        pointBackgroundColor: "rgba(151,187,205,0.5)",
    };

    constructor(private reports: ReportsService) {}

    ngOnInit() {
        this.resetData();

        setTimeout(() => {
            this.onInit.emit(this);
        });
    }

    /**
     * Refresh chart with data for given time period.
     */
    public refresh(filters, compareFilters) {
        this.chartStatus.loading = true;

        if (compareFilters) {
            this.fetchDataForChart('secondary', compareFilters);
        } else {
            this.fetchDataForChart('primary', filters);
        }
    }

    private fetchDataForChart(type = 'primary', filters) {
        this.destroyChart();
        this.resetData('secondary');

        this.reports.getEnvatoEarnings(Object.assign({}, filters)).subscribe(response => {
            this.updateChart(response.data, type);
        }, () => {
            this.chartStatus.loading = false;
        });
    }

    /**
     * Called after all needed data is fetched from server.
     */
    private updateChart(data, type = 'primary') {
        this.populateData(type, data);

        if (this.data[type].data && this.data[type].data.length) {
            this.createChart(this.data.primary.data, this.data.secondary.data, Object.keys(data.monthly));
        }

        this.chartStatus.loading = false;
    }

    /**
     * Populate charts data array with given data.
     */
    private populateData(key: string, data: any) {
        if (data.monthly && Object.keys(data.monthly).length) {

            //push earnings of all months into array
            let earnings = [];
            for(let key in data.monthly) earnings.push(data.monthly[key].amount);

            //populate data object
            this.data[key].data   = earnings;
            this.data[key].sales  = data.sales;
            this.data[key].totals = data.totals;
            this.data[key].items  = data.items;
            this.data[key].monthly  = data.monthly;
        }

        //no valid data
        else {
            this.data[key] = {sales: []};
        }
    }

    /**
     * Reset all charts data.
     */
    private resetData(type = null) {
        if ( ! type) {
            this.data = {primary: {}, secondary: {}};
        } else if (type === 'secondary') {
            this.data.secondary = {};
        }
    }

    /**
     * Create a Chart.js instance.
     */
    private createChart(data, data2, labels) {
        let datasets = [];

        datasets.push(Object.assign({data: data, label: 'Earnings'}, this.primaryDatasetStyles));

        if (data2 && data2.length) {
            datasets.push(Object.assign({data: data2}, this.secondaryDatasetStyles))
        }

        //create new chart
        this.ChartInstance = new Chart(this.canvas.nativeElement, {
            type: 'line',
            data: {labels: labels, datasets: datasets},
            options: {
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {yAxes: [
                    {
                        labels: {show: true},
                        ticks: {
                            stepSize: this.getStepSize(data),
                            callback: function(value) { return '$'+value; }
                        },
                    },
                ]}
            }
        });
    }

    ngOnDestroy() {
        this.destroyChart();
    }

    /**
     * Destroy Chart.js instance
     */
    private destroyChart() {
        if (this.ChartInstance) {
            this.ChartInstance.destroy();
        }
    }

    /**
     * Get step size for chart from data and preferred number of steps.
     */
    private getStepSize(data: string[], steps = 12) {
        let max = 0;

        for (var i = 0; i < data.length; i++) {
            let value = parseInt(data[i]);
            if (value > max) max = value;
        }

        if (steps > max) {
            return 30;
        } else {
            //round to nearest 5
            return Math.ceil(max/steps/5)*5;
        }
    }

    /**
     * Get styles for chart.js datasets.
     */
    private getChartStyles() {
        return [
            {
                backgroundColor: "hsla(91, 75%, 41%, 0.2)",
                borderColor: "hsla(91, 75%, 41%, 1)",
                borderWidth: 2,
                tension: 0,
                pointBackgroundColor: "hsla(91, 75%, 41%, 1)",
            },
            {
                borderColor: '#009DDC',
                borderWidth: 2,
                tension: 0,
                pointBackgroundColor: '#009DDC'
            }
        ];
    }
}

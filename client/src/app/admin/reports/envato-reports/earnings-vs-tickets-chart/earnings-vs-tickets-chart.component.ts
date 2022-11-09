import {Component, OnInit, OnDestroy, Input, Output, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {ReportsService} from "../../reports.service";
import {Observable} from 'rxjs/Rx';
import * as Chart from 'chart.js'

@Component({
    selector: 'earnings-vs-tickets-chart',
    template: '<canvas id="earnings-vs-tickets-chart" #canvas></canvas>'
})

export class EarningsVsTicketsChartComponent implements OnInit, OnDestroy {
    @ViewChild('canvas') canvas: ElementRef;

    /**
     * names of all months
     */
    @Input() months: string[];

    /**
     * Current time period filters for chart.
     */
    @Input() filters: any;

    /**
     * Indicates if any charts are currently loading data from server.
     */
    @Input() chartStatus: any;

    @Output() onInit = new EventEmitter();

    public data = {primary: {}};

    /**
     * Chart.js instance.
     */
    private ChartInstance;

    constructor(private reports: ReportsService) {}

    /**
     * Refresh chart with data for given time period.
     */
    public refresh(filters) {
        this.destroyChart();
        this.chartStatus.loading = true;

        Observable.forkJoin(
            this.reports.getEnvatoEarnings(filters),
            this.reports.getTicketsReportForRange({from_month: filters.month})
        ).subscribe(responses => {
            this.onDataFetched(responses);
        }, () => {
            this.chartStatus.loading = false;
        });
    }

    ngOnInit() {
        setTimeout(() => {
            this.onInit.emit(this);
        });
    }

    /**
     * Called after all needed data is fetched from server.
     */
    private onDataFetched(responses) {
        let ticketsData = [];
        for(var key in responses[1].data.dailyCounts) {
            ticketsData.push(responses[1].data.dailyCounts[key]);
        }

        let earningsData = [];
        for(var key in responses[0].data.monthly) {
            earningsData.push(responses[0].data.monthly[key].amount);
        }

        this.data.primary['totals']   = responses[0].data.totals;
        this.data.primary['sales']    = responses[0].data.sales;
        this.data.primary['items']    = responses[0].data.items;
        this.data.primary['data']     = earningsData;
        this.data.primary['monthly']  =  responses[0].data.monthly;
        this.createChart(earningsData, ticketsData);

        this.chartStatus.loading = false;
    }

    /**
     * Create a Chart.js instance.
     */
    private createChart(earningsData, ticketsData) {
        let styles = this.getChartStyles();

        //create primary dataset
        let datasets = [];
        datasets.push(Object.assign({data: earningsData, label: 'Earnings', yAxisID: 'y-axis-1'}, styles[0]));
        datasets.push(Object.assign({data: ticketsData, fill: false, label: 'Ticket Count', yAxisID: 'y-axis-2'}, styles[1]));

        //create new chart
        this.ChartInstance = new Chart(this.canvas.nativeElement, {
            type: 'line',
            data: {labels: Object.keys(earningsData), datasets: datasets},
            options: {
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                scales: {yAxes: [
                    {
                        id: 'y-axis-1',
                        labels: {show: true},
                        ticks: {
                            stepSize: this.getStepSize(earningsData),
                            callback: function(value) { return '$'+value; }
                        },
                    },
                    {
                        id: 'y-axis-2',
                        position: 'right',
                        gridLines:{display: false},
                        labels: {show: true},
                        ticks: {stepSize: this.getStepSize(ticketsData), beginAtZero:true}
                    }
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

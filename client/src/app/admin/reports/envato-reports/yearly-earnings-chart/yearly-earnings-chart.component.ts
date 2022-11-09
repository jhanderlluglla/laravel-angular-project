import {Component, OnInit, OnDestroy, Input, Output, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {ReportsService} from "../../reports.service";
import * as Chart from 'chart.js'

@Component({
    selector: 'yearly-earnings-chart',
    template: '<canvas id="yearly-earnings-chart" #canvas></canvas>'
})

export class YearlyEarningsChartComponent implements OnInit, OnDestroy {
    @ViewChild('canvas') canvas: ElementRef;

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

    ngOnInit() {
        setTimeout(() => {
            this.onInit.emit(this);
        });
    }

    /**
     * Refresh chart with data for given time period.
     */
    public refresh(filters) {
        this.destroyChart();
        this.chartStatus.loading = true;

        this.reports.getEnvatoEarnings(Object.assign({yearly: true}, filters)).subscribe(response => {
            this.onDataFetched(response);
        });
    }

    /**
     * Called after all needed data is fetched from server.
     */
    private onDataFetched(response) {
        let earningsData = []; let labels = [];

        for(var key in response.data.yearly) {
            earningsData.push(response.data.yearly[key].amount);
            labels.push(key);
        }

        this.data.primary['totals'] = response.data.totals;
        this.data.primary['data'] = earningsData;
        this.createChart(earningsData, labels);

        this.chartStatus.loading = false;
    }

    /**
     * Create a Chart.js instance.
     */
    private createChart(data, labels) {
        let styles = this.getChartStyles();

        //create primary dataset
        let datasets = [];
        datasets.push(Object.assign({data: data, label: 'Earnings'}, styles[0]));

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

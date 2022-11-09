import {Component, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import * as Chart from 'chart.js'

@Component({
    selector: 'first-response-by-hours-chart',
    template: '<canvas id="first-response-by-hours-canvas" #canvas></canvas>'
})

export class FirstResponseByHoursChartComponent implements OnDestroy {
    @ViewChild('canvas') canvas: ElementRef;

    /**
     * Chart.js instance.
     */
    private ChartInstance;

    /**
     * Refresh chart with given data.
     */
    public refresh(data1, data2) {
        this.destroyChart();

        let formatted = this.prepareDatasets([data1, data2]);

        this.createChart(formatted.data, formatted.labels);
    }

    /**
     * Prepare datasets and labels for chart.
     */
    private prepareDatasets(datasets) {
        let formattedData = [];

        let labels  = Object.keys(datasets[0]);

        datasets.forEach((data, key) => {
            if (data) {
                let dataOnly = labels.map(key => data[key]['percentage']),
                    styles   = this.getChartStyles();

                formattedData.push(Object.assign({data: dataOnly, label: 'Percentage of all tickets'}, styles[key]));
            }
        });

        return {labels, data: formattedData};
    }

    /**
     * Create a Chart.js instance.
     */
    private createChart(datasets, labels) {
        this.ChartInstance = new Chart(this.canvas.nativeElement, {
            type: 'bar',
            data: {labels: labels, datasets: datasets},
            options: {
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            ticks: {
                                callback: function(value) { return value+' hours'; }
                            },
                        }
                    ],
                    yAxes: [
                        {
                            ticks: {
                                callback: function(value) { return value+'%'; }
                            },
                        }
                    ]
                }
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
     * Get styles for chart.js datasets.
     */
    private getChartStyles() {
        return [
            {
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
                tension: 0,
                pointBackgroundColor: "rgba(255, 99, 132, 1)",
            },
            {
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }
        ];
    }
}

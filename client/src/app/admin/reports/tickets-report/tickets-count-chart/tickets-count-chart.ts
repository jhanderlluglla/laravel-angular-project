import {Component, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import * as Chart from 'chart.js'
import * as moment from 'moment';

@Component({
    selector: 'tickets-count-chart',
    template: '<canvas id="tickets-count-canvas" #canvas></canvas>'
})

export class TicketsCountChartComponent implements OnDestroy {
    @ViewChild('canvas') canvas: ElementRef;

    /**
     * Chart.js instance.
     */
    private ChartInstance;

    /**
     * Refresh chart with given data.
     */
    public refresh(data1, data2 = null) {
        if ( ! data1) return;

        this.destroyChart();

        let formatted = this.prepareDatasets([data1, data2]);

        this.createChart(formatted.data, formatted.labels);
    }

    /**
     * Prepare datasets and labels for chart.
     */
    private prepareDatasets(datasets) {
        let months = moment.monthsShort();

        let formattedData = [];

        let labels = Object.keys(datasets[0]).map(label => {
            let monthAndDay = label.split('.');
            return months[parseInt(monthAndDay[0])-1]+' '+monthAndDay[1];
        }).reverse();

        datasets.forEach((data, key) => {
            if (data) {
                let dataOnly = Object.keys(data).map(key => data[key]).reverse(),
                    styles   = this.getChartStyles();
                formattedData.push(Object.assign({data: dataOnly, label: 'New Tickets'}, styles[key]));
            }
        });

        return {labels, data: formattedData};
    }

    /**
     * Create a Chart.js instance.
     */
    private createChart(datasets, labels) {
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
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                tension: 0,
                pointBackgroundColor: "rgba(75, 192, 192, 1)",
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

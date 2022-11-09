import {Component, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import * as Chart from 'chart.js'

@Component({
    selector: 'tickets-by-tags-chart',
    template: '<canvas id="tickets-by-tags-canvas" #canvas></canvas>'
})

export class TicketsByTagsChartComponent implements OnDestroy {
    @ViewChild('canvas') canvas: ElementRef;

    /**
     * Chart.js instance.
     */
    private ChartInstance;

    /**
     * Refresh chart with given data.
     */
    public refresh(data1, data2) {
        if ( ! data1) return;

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

        datasets.forEach(data => {
            if (data) {
                let dataOnly = labels.map(key => data[key]['count']),
                    styles   = this.getChartStyles();

                formattedData.push(Object.assign({data: dataOnly, label: 'New Tickets'}, styles));
            }
        });

        return {labels, data: formattedData};
    }

    /**
     * Create a Chart.js instance.
     */
    private createChart(datasets, labels) {
        this.ChartInstance = new Chart(this.canvas.nativeElement, {
            type: 'doughnut',
            data: {labels: labels, datasets: datasets},
            options: {
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'right',
                },
                //events: false,
                events: [],
                animation: {
                    duration: 500,
                    easing: "easeOutQuart",
                    onComplete: this.drawPercentages,
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
     * Draw percentages on each pie chart slice.
     */
    private drawPercentages() {
        //TODO: refactor the stuff commented out to avoid ts errors
        // var ctx = this.chart.ctx;
        // ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'bottom';
        //
        // this.data.datasets.forEach(function (dataset) {
        //     for (var i = 0; i < dataset.data.length; i++) {
        //         var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
        //             total = dataset._meta[Object.keys(dataset._meta)[0]].total,
        //             mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
        //             start_angle = model.startAngle,
        //             end_angle = model.endAngle,
        //             mid_angle = start_angle + (end_angle - start_angle)/2;
        //
        //         var x = mid_radius * Math.cos(mid_angle);
        //         var y = mid_radius * Math.sin(mid_angle);
        //
        //         ctx.fillStyle = 'rgba(0,0,0,.87)';
        //         var percent = String(Math.round(dataset.data[i]/total*100)) + "%";
        //         ctx.fillText(percent, model.x + x, model.y + y + 15);
        //     }
        // });
    }

    /**
     * Get styles for chart.js datasets.
     */
    private getChartStyles() {
        return {
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ],
        }
    }
}

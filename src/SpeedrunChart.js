import React from 'react';
import Chart from 'chart.js';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

class SpeedrunChart extends React.Component {

    constructor() {
        super();
        this.chart = null;
        momentDurationFormat(moment);
    }

    componentDidMount() {
        const data = [{
            t: new Date("2001-12-2"),
            y: 1000
        },{
            t: new Date("2002-12-10"),
            y: 500
        },{
            t: new Date("2004-12-2"),
            y: 300
        },{
            t: new Date("2010-12-2"),
            y: 200
        },{
            t: new Date("2020-12-2"),
            y: 100
        }]
        const data2 = [{
            t: new Date("2001-08-2"),
            y: 3000
        },{
            t: new Date("2002-12-5"),
            y: 300
        },{
            t: new Date("2004-02-2"),
            y: 500
        },{
            t: new Date("2015-12-2"),
            y: 100
        },{
            t: new Date("2020-12-2"),
            y: 50
        }]
        this.chart = new Chart('speedchart', {
            type: 'line',
            data: {
                xAxisID: "x-axis",
                yAxisID: "y-axis",
                borderWidth: 10,
                datasets: [{
                    label: "runner a",
                    data: data,
                    steppedLine: 'before',
                    fill: false,
                    backgroundColor: 'rgba(225, 99, 132, 0.6)',
                    borderColor: 'rgba(225, 99, 132, 1)',
                },{
                    label: "runner b",
                    data: data2,
                    steppedLine: 'before',
                    fill: false,
                    backgroundColor: 'rgba(99, 225, 132, 0.6)',
                    borderColor: 'rgba(99, 225, 132, 1)',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes:[{

                        type: 'time',
                        time: {
                            unit: 'year',
                        },
                        displayFormat: {
                            quarter: "YYYY-MM-DD",
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            stepSize: 1,
                            callback: function(tickValue, index, ticks) {
                                return moment.duration(tickValue, 's').format("mm:ss");
                            }
                        }
                    }],
                },
                title: {
                    display: true,
                    text: "speedrun bop chart",
                }
            }
        });
    }
    render() {

        return (
            <div>
            <canvas id='speedchart' width='400' height='400'></canvas>
            </div>
        )
    }
}

export default SpeedrunChart;

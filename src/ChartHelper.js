import Chart from 'chart.js';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

const options = {
    responsive: true,
    title: {
        display: true,
        text: "speedrun bop chart",
    },
    layout: {
        padding: {
            right: 50,
            left: 20,
            top: 10,
        },
    },
    scales: {
        xAxes:[{

            type: 'time',
            time: {
                unit: 'year',
            },
            displayFormat: {
                quarter: "YYYY-MM-DD",
            },
            ticks:{
                max: new Date(),
            },
        }],
        yAxes: [{
            type: 'logarithmic',
            ticks: {
                stepSize: 1,
                callback: function(tickValue, index, ticks) {
                    return moment.duration(tickValue, 's').format("hh:mm:ss");
                }
            }
        }],
    },
}
var plugin = {
    zoom: {
        pan: {
            enabled: true,
            mode: 'x',
        },
        zoom: {
            enabled: true,
            drag: true,
            mode: 'x',
            speed: 1.0,
        },
    },
}


function convertData(runs) {
    return runs.map((user) => { // Map users
        var runs = user.data
        var data = runs.map((run) => { // Map runs
            return {
                t: new Date(run.submitted), // Date
                y: run.times.primary_t, // seconds
            }
        });
        data.push({
            t: new Date(),
            y: data[data.length-1].y, // latest run
        }); // Too cluttered
        var player = runs[0].players.data[0];
        return {
            label: player.names.international, // Runner name
            data: data,
            fill: false,
            backgroundColor: player['name-style']['color-from'].light,
            borderColor:  player['name-style']['color-from'].dark,
            steppedLine: 'before',
        }
    });
}

function drawChart(ctx, runs) {
    momentDurationFormat(moment);
    const dataset = convertData(runs);
     return new Chart('speedchart', {
          type: 'line',
          data: {
              xAxisID: "x-axis",
              yAxisID: "y-axis",
              borderWidth: 10,
              datasets: dataset,
          },
          options: options,
          plugins: plugin,
          });
}

export default drawChart;

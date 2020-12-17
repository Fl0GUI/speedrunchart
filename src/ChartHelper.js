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
      type: "logarithmic",
      ticks: {
        stepSize: 1,
        callback: function(tickValue, index, ticks) {
          return moment.duration(tickValue, 's').format("hh:mm:ss");
        },
        min: 0,
      }
    }],
  },
  plugins : {
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy',
        rangeMin: {
          y: 0,
        },
        rangeMax: {
          x: new Date(),
        }
      },
      zoom: {
        enabled: true,
        mode: 'xy',
        rangeMin: {
          y: 0,
        },
        rangeMax: {
          x: new Date(),
        },
      },
    },
  }
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

function getBounds(data) {
  const individual = data.map(runner => { // iterate over runners
    return {
      t: runner.data.map(point => point.t),
      y: runner.data.map(point => point.y),
  }});
  const dates = individual.map(o => o.t).flat();
  const times = individual.map(o => o.y).flat();
  return {
    tRange: [Math.min(...dates), Math.max(...dates)],
    yRange: [Math.min(...times), Math.max(...times)],
  }
}


function drawChart(ctx, runs) {
  momentDurationFormat(moment);
  const dataset = convertData(runs);
  const bounds = getBounds(dataset);

  options.plugins.zoom.zoom.rangeMin.y = bounds.yRange[0];
  options.plugins.zoom.zoom.rangeMin.x = bounds.tRange[0];
  options.plugins.zoom.pan.rangeMin.y = bounds.yRange[0] - 60;
  options.plugins.zoom.pan.rangeMin.x = bounds.tRange[0];

  options.plugins.zoom.zoom.rangeMax.y = bounds.yRange[1];
  options.plugins.zoom.zoom.rangeMax.x = bounds.tRange[1];
  options.plugins.zoom.pan.rangeMax.y = bounds.yRange[1] + 60;
  options.plugins.zoom.pan.rangeMax.x = bounds.tRange[1];

  return new Chart('speedchart', {
    type: 'line',
    data: {
      xAxisID: "x-axis",
      yAxisID: "y-axis",
      borderWidth: 10,
      datasets: dataset,
    },
    options: options
  });
}

export default drawChart;

import React from 'react';
import drawChart from  './ChartHelper.js';

class SpeedrunChart extends React.Component {

    componentDidMount() {
        drawChart('speedchart').then(() => {this.forceUpdate()});
    }

    render() {
        // TODO add game and category form input 
        return (
            <div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.1"></script>
            <script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script>
            <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@0.7.4"></script>
            <canvas id='speedchart' width='400' height='400'></canvas>
            </div>
        )
    }
}

export default SpeedrunChart;

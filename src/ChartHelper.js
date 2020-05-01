import Chart from 'chart.js';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';
var fetchUrl = require('node-fetch');

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

function fetchData() {

    function fetchJson(uri, query="") {
        return fetchUrl(uri + query).then(resp => resp.json());
    }
    function findLink(o, linkname) {
        return o.links.filter((e) => e.rel === linkname)[0].uri;
    }
    function fetchLink(o, linkname, query="") {
        return fetchJson(findLink(o, linkname), query);
    }

    function passPromise(v) {
        return new Promise((res, rej) => res(v));
    }

    const game = "Hollow Knight";
    const nplayers = 30;
    var gameID, categoryID, variableKey, variableVal;
    return fetchJson(`https://www.speedrun.com/api/v1/games?name=${game}` // Give game
    ).then((games) => { // Get game give category and leaderboardURI
        const game = games.data[0];
        gameID = game.id
        return Promise.all([fetchLink(game, "categories"), passPromise(findLink(game, "leaderboard"))]);
    }
    ).then(([categories, leaderboardUri]) => { // Get category and leaderboard URI Give variables and leaderboard URI
        const category = categories.data[0]; // TODO not hardcoded
        categoryID = category.id;

        return Promise.all([fetchLink(category, "variables"), passPromise(leaderboardUri)]);
    }
    ).then(([variables, leaderboardUri]) => { // Get variables and leaderboard URI Give leaderboard
        variableKey = variables.data[1].id; // TODO not hardcoded
        variableVal = variables.data[1].values.default; // TODO not hardcoded
        return fetchJson(leaderboardUri, `?game=${gameID}&category=${categoryID}&status=verified&orderby=submitted&embed=players&direction=desc&var-${variableKey}=${variableVal}`);
    }
    ).then((leaderboard) => { // Get leaderboard Give players with runs
        return Promise.all(leaderboard.data.players.data.slice(0,nplayers)
            .map((player) => {
                const runs = findLink(player, "runs");
                // set query string
                const query = "&game=" + gameID +
                    "&category=" + categoryID + 
                    "&status=verified" +
                    //"&var-" + variableKey + "=" + variableVal + Doesn't work for runs?
                    "&orderby=date" +
                    "&direction=asc" +
                    "&embed=players";
                return fetchJson(runs, query);
            }));
    }
    ).then((players) => { // Get players with runs Give player wiwth runs but filtered
        return players.map((player) => {
            var best = player.data[0].times.primary_t;
            player.data = player.data.filter((run) => {
                var res = run.values[variableKey] === variableVal &&
                    run.times.primary_t <= best;
                best = run.times.primary_t;
                return res
            });
            return player;
        });

    });
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

function drawChart(ctx) {
    momentDurationFormat(moment);
    return fetchData().then((runs) => {
        const dataset = convertData(runs);
        new Chart('speedchart', {
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
    });
}

export default drawChart;

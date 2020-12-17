import React from 'react';
import drawChart from  './ChartHelper.js';
var fetchUrl = require('node-fetch');

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
class SpeedrunChart extends React.Component {

    componentDidMount() {
        fetchData().then(data => {
        drawChart('speedchart', data)
        this.forceUpdate()
        });
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

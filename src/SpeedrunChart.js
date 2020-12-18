import React from 'react';
import drawChart from  './ChartHelper.js';
import Chart from 'chart.js';
import zoom from 'chartjs-plugin-zoom';
var fetchUrl = require('node-fetch');

function fetchJson(uri, query="") {
  return fetchUrl(uri + query).then(resp => resp.json());
}
function findLink(o, linkname, pre=(o)=>o) {
  return pre(o).links.filter((e) => e.rel === linkname)[0].uri;
}
function fetchLink(o, linkname, query="", pre) {
  return fetchJson(findLink(o, linkname, pre), query);
}
function passPromise(v) {
  return new Promise((res, rej) => res(v));
}

function filterRunOnVarable(run, varKey, varVal) {
  return run.values[varKey] === varVal;
}

function fetchData(players=[]) {

  const game = "Hollow Knight";
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
    return Promise.all(players.map( player =>
      fetchJson(`https://www.speedrun.com/api/v1/users?lookup=${player}&max=1`
      ).then(user => 
        fetchLink(user, "runs", `&game=${gameID}&category=${categoryID}&status=verified&orberby=submitted&direction=desc&var-${variableKey}=${variableVal}`,
        (o)=>o.data[0]).then(o => {
          return {
            player: user.data[0],
            data: o.data.filter(r => filterRunOnVarable(r, variableKey, variableVal)),
          }})
    )))
  }).then(e => {console.log(e); return e});
}

class SpeedrunChart extends React.Component {


  componentDidMount() {
    Chart.plugins.register(zoom)
    fetchData(['alegendarybagel', "nerfirelia"]).then(data => {
      drawChart('speedchart', data)
      this.forceUpdate()
    });
  }

  render() {
    // TODO add game, category and users form input 
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

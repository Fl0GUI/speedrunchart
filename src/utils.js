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

export { fetchJson, findLink, fetchLink };

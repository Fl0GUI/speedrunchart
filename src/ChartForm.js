import React from 'react';
import { Button, Search, Dropdown } from 'semantic-ui-react';
import debounce from 'lodash.debounce';
import { fetchJson } from './utils.js';

/*
 * Game string -> games -> game id
 * game id -> caterogies -> category
 * category id -> variables -> variable
 *
 ***/

const urlBase = "https://www.speedrun.com/api/v1/"

class Categories extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
    }
  }

  componentDidMount() {
    fetchJson(
      this.props.url
    ).then(
      (result) => {
        const options = result.data.map((r) => {
          let values = [{key: 0, text: 'any', value: 0}];
          values = values.concat(Object.entries(r.values.values).map(kv => {
            return {
              key: kv[0],
              text: kv[1].label,
              value: kv[0],
            }
          }));
          return {
            id: r.id,
            options: values,
          }
        });
        this.setState({options: options});
      }
    );
  } 

  render() {
    const dropdowns = this.state.options.map((o) =>
      <Dropdown
        key={o.id}
        placeholder='select an option'
        selection
        options={o.options}
        onChange={(e, d) => this.props.setKeyVal(o.id, d.value)}
      />
    );
    return (
      <>
      {dropdowns}
      </>
    )
  }
}

class ApiSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      results: [],
      selected : '',
    }
    this.updateResults = debounce(this.updateResults.bind(this), 200);
  }

  updateResults(e, data) {
    this.setState({loading: true, results: []});
    const str = data.value;
    fetchJson(this.props.createUrl(str)).then((results) => {
      const gs = results.data.map(this.props.extraction);
      this.setState({loading: false, results: gs});
      });
  
  }

  render() {
    return (
      <Search
          onResultSelect={(e, data) => {this.props.onResult(data.result)}}
          loading={this.state.loading}
          onSearchChange={this.updateResults}
          results={this.state.results}
      />
    )
  }
}


class ChartForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameid: '',
      categoryid: '',
      vars: {},
    }
  }

  render() {
    return (
      <>
        <ApiSearch
          createUrl={(v) => urlBase + `games?name=${v}`}
          extraction={(o) => {return {title: o.names.international, id:o.id}}}
          onResult={(data) => this.setState({gameid: data.id})}
        />
      {this.state.gameid &&
        <ApiSearch
          createUrl={(v) => urlBase + `games/${this.state.gameid}/categories?name=${v}`}
          extraction={(o) => {return {title: o.name, id:o.id}}}
          onResult={(data) => this.setState({categoryid: data.id})}
        />
      }
      {this.state.categoryid &&
          <>
            <Categories
              url={urlBase + `categories/${this.state.categoryid}/variables`}
              setKeyVal={(key, val) => this.setState( (state) => {
                state.vars.key = val
                return state
              }
              )}
            />
          <Button onClick={() => this.props.onSubmit(this.state.gameid, this.state.categoryid, this.state.vars)}>
            click me harder
          </Button>
          </>
      }
      </>
    )
  }

}

export default ChartForm;

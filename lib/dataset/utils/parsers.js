var Dataset; /* injected */

var each = require('../../utils/each'),
    flatten = require('../utils/flatten');

// Parser definitions
var parsers = {
  'metric':                   parseMetric,
  'interval':                 parseInterval,
  'grouped-metric':           parseGroupedMetric,
  'grouped-interval':         parseGroupedInterval,
  'double-grouped-metric':    parseDoubleGroupedMetric,
  'double-grouped-interval':  parseDoubleGroupedInterval,
  'funnel':                   parseFunnel,
  'list':                     parseList,
  'extraction':               parseExtraction
};

module.exports = initialize;

function initialize(lib){
  Dataset = lib;
  return function(name){
    if (!parsers[name]) {
      throw 'Requested parser does not exist';
    }
    else {
      return parsers[name];
    }
  };
}

function parseMetric(res){
  var dataset = new Dataset();
  return dataset.set(['Value', 'Result'], res.result);
}

//var myParser = Dataset.parser('interval', 'timeframe.end');
function parseInterval(res){
  var dataset = new Dataset(),
      options = Array.prototype.slice.call(arguments, 1);

  each(res.result, function(record, i){
    var index = options[0] && options[0] === 'timeframe.end' ? record.timeframe.end : record.timeframe.start;
    dataset.set(['Result', index], record.value);
  });
  return dataset;
}

function parseGroupedMetric(res){
  var dataset = new Dataset();
  each(res.result, function(record, i){
    var label;
    each(record, function(key, value){
      if (key !== 'result') {
        label = key;
      }
    });
    dataset.set(['Result', record[label]], record.result);
  });
  return dataset;
}

//var myParser = Dataset.parser('grouped-interval', 'timeframe.end');
function parseGroupedInterval(res){
  var dataset = new Dataset(),
      options = Array.prototype.slice.call(arguments, 1);

  each(res.result, function(record, i){
    var index = options[0] && options[0] === 'timeframe.end' ? record.timeframe.end : record.timeframe.start;
    if (record.value.length) {
      each(record.value, function(group, j){
        var label;
        each(group, function(value, key){
          if (key !== 'result') {
            label = key;
          }
        });
        dataset.set([ group[label] || '', index ], group.result);
      });
    }
    else {
      dataset.appendRow(index);
    }
  });
  return dataset;
}

//var myParser = Dataset.parser('double-grouped-metric', ['first', 'second']);
function parseDoubleGroupedMetric(res){
  var dataset = new Dataset(),
      options = Array.prototype.slice.call(arguments, 1);

  if (!options[0]) throw 'Requested parser requires a sequential list (array) of properties to target as a second argument';
  each(res.result, function(record, i){
    dataset.set([ record[options[0][0]], record[options[0][1]] ], record.result);
  });
  return dataset;
}

//var myParser = Dataset.parser('double-grouped-interval', ['first', 'second'], 'timeframe.end');
function parseDoubleGroupedInterval(res){
  var dataset = new Dataset(),
      options = Array.prototype.slice.call(arguments, 1);

  if (!options[0]) throw 'Requested parser requires a sequential list (array) of properties to target as a second argument';

  each(res.result, function(record, i){
    var index = options[1] && options[1] === 'timeframe.end' ? record.timeframe.end : record.timeframe.start;
    each(record['value'], function(value, j){
      var label = String(value[options[0][0]]) + ' ' + String(value[options[0][1]]);
      dataset.set([ label, index ], value.result);
    });
  });
  return dataset;
}

function parseFunnel(res){
  var dataset = new Dataset();
  each(res.result, function(value, i){
    dataset.set( [ 'Step Value', res.steps[i].event_collection ], value );
  });
  return dataset;
}

function parseList(res){
  var dataset = new Dataset();
  each(res.result, function(value, i){
    dataset.set( [ 'Value', i+1 ], value );
  });
  return dataset;
}

function parseExtraction(res){
  var dataset = new Dataset();
  each(res.result, function(record, i){
    each(flatten(record), function(value, key){
      dataset.set([key, i+1], value);
    });
  });
  dataset.deleteColumn(0);
  return dataset;
}
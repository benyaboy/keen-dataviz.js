import { each } from '../../utils/each';
import createNullList from '../utils/create-null-list';
import { appendRow, appendColumn } from './append';

export function updateColumn(q, input) {
  var self = this,
      index = (typeof q === 'number') ? q : this.matrix[0].indexOf(q);

  if (index > -1) {

    if (typeof input === 'function') {

      each(self.data(), function(row, i){
        var cell;
        if (i > 0) {
          cell = input.call(self, row[index], i, row);
          if (typeof cell !== 'undefined') {
            self.matrix[i][index] = cell;
          }
        }
      });

    } else if (!input || input instanceof Array) {
      input = input || [];

      if (input.length <= self.data().length - 1) {
        input = input.concat( createNullList(self.data().length - 1 - input.length) );
      }
      else {
        // If this new column is longer than existing columns,
        // we need to update the rest to match ...
        each(input, function(value, i){
          if (self.matrix.length -1 < input.length) {
            appendRow.call(self, String( self.matrix.length ));
          }
        });
      }

      each(input, function(value, i){
        self.matrix[i+1][index] = value;
      });

    }

  }
  return self;
}

export function updateRow(q, input){
  var self = this,
      index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {

    if (typeof input === 'function') {

      each(self.data()[index], function(value, i){
        var col = self.selectColumn(i),
        cell = input.call(self, value, i, col);
        if (typeof cell !== 'undefined') {
          self.matrix[index][i] = cell;
        }
      });

    } else if (!input || input instanceof Array) {
      input = input || [];

      if (input.length <= self.matrix[0].length - 1) {
        input = input.concat( createNullList( self.matrix[0].length - 1 - input.length ) );
      }
      else {
        each(input, function(value, i){
          if (self.matrix[0].length -1 < input.length) {
            appendColumn.call(self, String( self.matrix[0].length ));
          }
        });
      }

      each(input, function(value, i){
        self.matrix[index][i+1] = value;
      });
    }

  }
  return self;
}

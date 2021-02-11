import {DataContainerInterface} from './data-container-interface';
import {DataRow} from './data-row';

export class MaskedDataContainer implements DataContainerInterface {
  constructor(parentDataContainer: DataContainerInterface, mask: number[]);

  numRows(): number;
  numColumns(): number;

  valueAt(rowIndex: number, columnIndex: number): any;

  row(rowIndex: number, safe?: boolean): DataRow;
  rowAsArray(rowIndex: number): any[];

  rows(safe?: boolean): Generator<any, void, any>;
  column(columnIndex: number): Generator<any, void, any>;
  flattenData(): any[][];
  getPlainIndex(): number[];

  map(func: (row: DataRow, index: number) => any, safe?: boolean, options?: object): any[];
  find(func: (row: DataRow, index: number) => any, safe?: boolean): any;
  reduce(func: (acc: any, row: DataRow, index: number) => any, initialValue): any[];
}

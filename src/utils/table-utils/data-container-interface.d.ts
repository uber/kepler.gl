import {DataRow} from './data-row';

export interface DataContainerInterface {
  /**
   * @returns number of rows in the data container
   */
  numRows(): number;

  /**
   * @returns number of columns in the data container
   */
  numColumns(): number;

  /**
   * @param rowIndex
   * @param columnIndex
   * @returns a value stored at a cell in the data container
   */
  valueAt(rowIndex: number, columnIndex: number): any;

  /**
   * Returns a row object
   * @param rowIndex
   * @param safe True indicates that DataRow object will be processed immediately and  won't be saved. Note: shered row is going to reference the dataset.
   * @returns a row object
   */
  row(rowIndex: number, safe?: boolean): DataRow;

  /**
   * @param rowIndex Index of the row to return
   * @returns A row represented as an array of values
   */
  rowAsArray(rowIndex: number): any[];

  /**
   * @param safe True indicates that DataRow object will be processed immediately and  won't be saved before acceesing the next row
   * @returns Returns an iterator to all rows in the data container
   */
  rows(safe?: boolean): Generator<any, void, any>;

  /**
   * @param columnIndex
   * @returns Returns an iterator to each value in a column in the data container
   */
  column(columnIndex: number): Generator<any, void, any>;

  /**
   * Returns the data container in form of any[][]
   */
  flattenData(): any[][];

  /**
   * Generates an array of indices for each row in the data container
   * @returns
   */
  getPlainIndex(): number[];

  /**
   * Creates a new array populated with the results of calling a provided function
   * on every row in the data container.
   * @param func
   * @param safe When true, it is assumed that the handler won't store the row object between iterations.
   * @returns
   */
  map(func: (row: DataRow, index: number) => any, safe?: boolean, options?: object): any[];

  /**
   * Returns the value of the first element in the provided array that satisfies the provided testing function.
   * @param func
   * @param safe When true, it is assumed that the handler won't store the row object between iterations.
   * @returns
   */
  find(func: (row: DataRow, index: number) => any, safe?: boolean): any;

  /**
   * Executes a reducer functionon each element of the array, resulting in single output value.
   * @param func
   * @param initialValue
   */
  reduce(func: (acc: any, row: DataRow, index: number) => any, initialValue): any[];
}

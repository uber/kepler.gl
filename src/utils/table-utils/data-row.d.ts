import {DataContainerInterface} from './data-container-interface';

export class DataRow {
  constructor(dataContainer: DataContainerInterface, rowIndex: number);

  valueAt(column: number): any;
  values(): any[];
  setSource(dataContainer: DataContainerInterface, rowIndex: number): void;
  map(handler: (elem: any, index: number) => any): any[];
}

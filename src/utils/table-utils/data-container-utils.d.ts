import {ProcessorResult} from 'processors/data-processor';
import {Field} from 'reducers';

import {DataContainerInterface} from './data-container-interface';

export enum DataForm {
  Rows,
  Columns
}

export type DataContainerOptions = {
  inputDataFormat?: DataForm;
  useSourceData?: boolean;
  fields?: Field[];
  outputDataForm?: DataForm;
};

export type DataContainerData = any[];

/**
 * Creates a data container wrapper for passed data
 * @param data in form of array of rows, or binary arrays // ! TODO
 * @param options
 * @returns A data container
 */
export function createDataContainer(
  data: DataContainerData,
  options?: DataContainerOptions
): DataContainerInterface;

/**
 * Creates a data container wrapper around another data container
 * @param data in form of a data container
 * @param maks id > mask[id]
 */
export function createMaskedDataContainer(
  data: DataContainerInterface,
  maks: number[]
): DataContainerInterface;

export function* rowsIterator(
  dataContainer: DataContainerInterface,
  safe: boolean
): Generator<any, void, any>;

export function* columnIterator(
  dataContainer: DataContainerInterface,
  columnIndex: number
): Generator<any, void, any>;

export function* mapIterator(iterator: any, mapping: any): any;

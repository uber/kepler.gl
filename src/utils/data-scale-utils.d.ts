import {DataContainerInterface} from './table-utils/data-container-interface';

function dataValueAccessor(any): any;
function sort(a: any, b: any): any;

export function getQuantileDomain(
  data: any[],
  valueAccessor?: typeof dataValueAccessor,
  sortFunc?: typeof sort
): number[];

export function getOrdinalDomain(
  data: DataContainerInterface,
  valueAccessor: typeof dataValueAccessor
): string[];

export function getLinearDomain(
  data: any[],
  valueAccessor?: typeof dataValueAccessor
): [number, number];

export function getLogDomain(
  data: any[],
  valueAccessor?: typeof dataValueAccessor
): [number, number];

import {
  Filter,
  FilterBase,
  PolygonFilter,
  KeplerTable,
  Datasets,
  FilterRecord,
  FieldDomain,
  TimeRangeFieldDomain,
  HistogramBin,
  Feature,
  FeatureValue,
  VisState,
  LineChart,
  TimeRangeFilter
} from '../reducers/vis-state-updaters';
import {Layer} from 'layers';
import {Field} from 'reducers/types';
import {ParsedConfig} from 'schemas';
import {FilterDatasetOpt} from './table-utils/kepler-table';
import {DataContainerInterface} from './table-utils/data-container-interface';
import {DataRow} from './table-utils/data-row';

export function applyFilterFieldName(
  filter: Filter,
  dataset: KeplerTable,
  fieldName: string,
  filterDatasetIndex?: number,
  option?: {mergeDomain: boolean}
): {
  filter: Filter | null;
  dataset: KeplerTable;
};

export function getDefaultFilter(dataId: string | null | string[]): FilterBase;
export function shouldApplyFilter(filter: Filter, datasetId: string): boolean;
export function validatePolygonFilter(
  dataset: KeplerTable,
  filter: PolygonFilter,
  layers: Layer[]
): {filter: PolygonFilter | null; dataset: KeplerTable};

export function validateFilter(
  dataset: KeplerTable,
  filter: Filter
): {filter: PolygonFilter | null; dataset: KeplerTable};

export function adjustValueToFilterDomain(value: Filter['value'], Filter): any;

export function filterDataset(
  dataset: KeplerTable,
  filters: Filter[],
  layers: Layer[],
  opt?: FilterDatasetOpt
): KeplerTable;

export function applyFiltersToDatasets(
  datasetIds: string[],
  datasets: Datasets,
  filters: Filter[],
  layers?: Layer[]
): Datasets;
export function getFilterRecord(
  dataId: string,
  filters: Filter[],
  option?: FilterDatasetOpt
): FilterRecord;

function filterFunction(data: DataRow, index?: number): boolean;

export function isValidFilterValue(type: string | null, value: any): boolean;
export function getFilterFunction(
  field: Field | null,
  dataId: string,
  filter: Filter,
  layers: Layer[]
): typeof filterFunction;

export type FilterResult = {
  filteredIndexForDomain?: number[];
  filteredIndex?: number[];
};
export function filterDataByFilterTypes(
  filters: {
    dynamicDomainFilters: Filter[] | null;
    cpuFilters: Filter[] | null;
    filterFuncs: {
      [key: string]: typeof filterFunction;
    };
  },
  dataContainer: DataContainerInterface
): FilterResult;

export type FilterChanged = {
  [key in keyof FilterRecord]: {
    [key: string]: 'added' | 'deleted' | 'name_changed' | 'value_changed' | 'dataId_changed';
  } | null;
};
export function diffFilters(
  filterRecord: FilterRecord,
  oldFilterRecord?: FilterRecord | {}
): FilterChanged;

export type FilterDomain = any;

export function getFieldDomain(dataContainer: DataContainerInterface, filed: Field): FieldDomain;

export function dataValueAccessor(data: any[]): number | null;
export function getTimestampFieldDomain(
  data: DataContainerInterface,
  valueAccessor: typeof dataValueAccessor
): TimeRangeFieldDomain;

export function getNumericFieldDomain(
  data: DataContainerInterface,
  valueAccessor: typeof dataValueAccessor
): RangeFieldDomain;

export function histogramConstruct(
  domain: [number, number],
  mappedValue: (Millisecond | null | number)[],
  bins: number
): HistogramBin[];

export function getHistogram(
  domain: [number, number],
  mappedValue: (Millisecond | null | number)[]
): {histogram: HistogramBin[]; enlargedHistogram: HistogramBin[]};

export function getNumericStepSize(diff: number): number;

export function mergeFilterDomainStep(filter: Filter, filterProps?: any): Filter | null;

export function getFilterProps(
  field: Field,
  FieldDomain: FieldDomain
): Partiel<Filter> & {fieldType: string};

export function generatePolygonFilter(layers: Layer[], feature: Feature): PolygonFilter;

export function filterDatasetCPU(state: VisState, dataId: string): VisState;

export function validateFilterWithData(
  dataset: KeplerTable,
  filter: Filter,
  layers: Layer[]
): {filter: Filter; dataset: KeplerTable};
export function featureToFilterValue(
  feature: Feature,
  filterId: string,
  properties?: {}
): FeatureValue;

export function getDefaultFilterPlotType(filter: Filter): string | null;
export function getFilterPlot(
  filter: Filter,
  dataset: KeplerTable
): {lineChart: LineChart; yAxs: Field} | {};
export function getFilterIdInFeature(f: FeatureValue): string;
export function isInRange(v: any, domain: number[]): boolean;
export function updateFilterDataId(dataId: string): FilterBase;
export function validateFiltersUpdateDatasets(
  state: VisState,
  filtersToValidate: ParsedConfig['visState']['filters']
): {
  validated: Filter[];
  failed: Filter[];
  updatedDatasets: Datasets;
};
export function isInPolygon(point: number[], polygon: object): boolean;
export function getIntervalBins(filter: TimeRangeFilter);
export function getTimeWidgetHintFormatter(domain: [number, number]): string;

export const FILTER_UPDATER_PROPS: {
  dataId: string;
  name: string;
  layerId: string;
};
export const LIMITED_FILTER_EFFECT_PROPS: {
  name: string;
};
export const PLOT_TYPES: {
  histogram: string;
  lineChart: string;
};

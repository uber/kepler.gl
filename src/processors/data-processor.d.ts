import {ProtoDataset} from '../actions';
import {Field} from 'reducers/vis-state-updaters';
import {SavedMap, ParsedDataset} from 'schemas';
import {DataContainerInterface} from 'utils/table-utils/data-container-interface';

type RowData = {
  [key: string]: any;
}[];
type ProcessorResult = {fields: Field[]; rows: any[][]} | null;
export function processGeojson(rawData: object): ProcessorResult;
export function processCsvData(rawData: string | any[][], header?: string[]): ProcessorResult;
export function processKeplerglJSON(rawData: SavedMap): ProcessorResult;
export function processRowObject(rawData: object[]): ProcessorResult;
export function processKeplerglDataset(
  rawData: object | object[]
): ParsedDataset | ParsedDataset[] | null;

export function validateInputData(data: any): ProcessorResult;

export function getSampleForTypeAnalyze(p: {
  fields: string[];
  dataContainer: DataContainerInterface;
  sampleCount?: number;
}): object[];

export function getFieldsFromData(data: RowData, fieldOrder: string[]): Field[];

export function parseCsvRowsByFieldType(
  rows: any[][],
  geoFieldIdx: number,
  field: Field,
  i: number
): void;

export function formatCsv(data: DataContainerInterface, fields: Field[]): string;

export function analyzerTypeToFieldType(aType: string): string;

export const DATASET_HANDLERS: {
  row: typeof processRowObject;
  geojson: typeof processGeojson;
  csv: typeof processCsvData;
  keplergl: typeof processKeplerglDataset;
};

export const Processors: {
  processGeojson: typeof processGeojson;
  processCsvData: typeof processCsvData;
  processRowObject: typeof processRowObject;
  processKeplerglJSON: typeof processKeplerglJSON;
  processKeplerglDataset: typeof processKeplerglDataset;
  analyzerTypeToFieldType: typeof analyzerTypeToFieldType;
  getFieldsFromData: typeof getFieldsFromData;
  parseCsvRowsByFieldType: typeof parseCsvRowsByFieldType;
  formatCsv: typeof formatCsv;
};

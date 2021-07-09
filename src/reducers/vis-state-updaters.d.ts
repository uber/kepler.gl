import {RGBColor, RGBAColor, Millisecond} from './types';
import {AddDataToMapOptions, ReceiveMapConfigPayload} from '../actions/actions';
import {ParsedConfig} from '../schemas';
import * as VisStateActions from 'actions/vis-state-actions';
import ActionTypes from 'constants/action-types';
import {LoaderObject} from '@loaders.gl/loader-utils';
import {KeplerTable, Field} from 'utils';

export {KeplerTable, Field};
export type HistogramBin = {
  x0: number | undefined;
  x1: number | undefined;
  count: number;
};

export type RangeFieldDomain = {
  domain: [number, number];
  step: number;
  histogram: HistogramBin[];
  enlargedHistogram: HistogramBin[];
};

export type SelectFieldDomain = {
  domain: [true, false];
};
export type MultiSelectFieldDomain = {
  domain: string[];
};

export type TimeRangeFieldDomain = {
  domain: [number, number];
  step: number;
  histogram: HistogramBin[];
  enlargedHistogram: HistogramBin[];
  mappedValue: (Millisecond | null)[];
  // auto generated based on time domain
  defaultTimeFormat?: string | null;
  // custom ui input
  timeFormat?: string | null;
  // custom ui input
  timezone?: string | null;
};
export type FieldDomain =
  | RangeFieldDomain
  | TimeRangeFieldDomain
  | SelectFieldDomain
  | MultiSelectFieldDomain;

export type LineChart = {
  series: {x: number; y: number}[];
  yDomain: [number, number];
  xDomain: [number, number];
};

export type FilterBase = {
  dataId: string[];
  id: string;

  freeze: boolean;

  // time range filter specific
  fixedDomain: boolean;
  enlarged: boolean;
  isAnimating: boolean;
  speed: number;
  showTimeDisplay?: boolean;

  // field specific
  name: string[]; // string
  type: string | null;
  fieldIdx: number[]; // [integer]
  domain: any[] | null;
  value: any;
  mappedValue?: number[];

  // plot
  yAxis: Field | null;
  plotType: string;
  lineChart?: LineChart;
  // gpu filter
  gpu: boolean;
  gpuChannel?: number[];
  fieldType?: string;

  // polygon
  layerId?: string[];
};

export type RangeFilter = FilterBase &
  RangeFieldDomain & {
    type: 'range';
    fieldType: 'real' | 'integer';
    value: [number, number];
    fixedDomain: true;
    typeOptions: ['range'];
  };

export type SelectFilter = FilterBase &
  SelectFieldDomain & {
    type: 'select';
    fieldType: 'boolean';
    value: boolean;
  };

export type MultiSelectFilter = FilterBase &
  MultiSelectFieldDomain & {
    type: 'range';
    fieldType: 'string' | 'date';
    value: string[];
  };
export type TimeRangeFilter = FilterBase &
  TimeRangeFieldDomain & {
    type: 'timeRange';
    fieldType: 'timestamp';
    fixedDomain: true;
    value: [number, number];
    bins?: Object;
    plotType: {
      [key: string]: any;
    };
  };

export type PolygonFilter = FilterBase & {
  layerId: string[];
  type: 'polygon';
  fixedDomain: true;
  value: Feature;
};

export type Filter =
  | FilterBase
  | RangeFilter
  | TimeRangeFilter
  | SelectFilter
  | MultiSelectFilter
  | PolygonFilter;

export type Datasets = {
  [key: string]: KeplerTable;
};

export type Feature = {
  id: string;
  properties: any;
  geometry: {
    type: string;
    coordinates: any;
  };
};
export type FeatureValue = {
  id: string;
  properties: {
    filterId: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
};
export type Editor = {
  mode: string;
  features: Feature[];
  selectedFeature: any;
  visible: boolean;
};
export type SplitMap = {
  layers: {[key: string]: boolean};
};
export type AnimationConfig = {
  domain: number[] | null;
  currentTime: number | null;
  speed: number;
  isAnimating?: boolean;
  // auto generated based on time domain
  defaultTimeFormat?: string | null;
  // custom ui input
  timeFormat?: string | null;
  // custom ui input
  timezone?: string | null;
  // hide or show control
  hideControl?: boolean;
};

export type BaseInteraction = {
  id: string;
  label: string;
  enabled: boolean;
  iconComponent: any;
};
export type TooltipField = {
  name: string;
  format: string | null;
};
export type CompareType = string | null;
export type TooltipInfo = BaseInteraction & {
  config: {
    fieldsToShow: {
      [key: string]: TooltipField[];
    };
    compareMode: boolean;
    compareType: CompareType;
  };
};
export type Geocoder = BaseInteraction & {
  position: number[] | null;
};
export type Brush = BaseInteraction & {
  config: {
    size: number;
  };
};
export type Coordinate = BaseInteraction & {
  position: number[] | null;
};
export type InteractionConfig = {
  tooltip: TooltipInfo;
  geocoder: Geocoder;
  brush: Brush;
  coordinate: Coordinate;
};
export type MapInfo = {
  title: string;
  description: string;
};
export type FileLoading = {
  filesToLoad: FileList;
  onFinish: (payload: any) => any;
  fileCache: any[];
};
export type FileLoadingProgress = {
  [key: string]: {
    percent: number;
    message: string;
    fileName: string;
    error: any;
  };
};

export type VisState = {
  mapInfo: MapInfo;
  layers: Layer[];
  layerData: any[];
  layerToBeMerged: any[];
  layerOrder: number[];
  filters: Filter[];
  filterToBeMerged: any[];
  datasets: Datasets;
  editingDataset: string | undefined;
  interactionConfig: InteractionConfig;
  interactionToBeMerged: any;
  layerBlending: string;
  hoverInfo: any;
  clicked: any;
  mousePos: any;
  layerClasses: LayerClassesType;
  animationConfig: AnimationConfig;
  editor: Editor;
  splitMaps: SplitMap[];
  splitMapsToBeMerged: SplitMap[];
  fileLoading: FileLoading | false;
  fileLoadingProgress: FileLoadingProgress;
  loaders: LoaderObject[];
  loadOptions: object;
  initialState?: Partial<VisState>;
  mergers: VisStateMergers;
  schema: KeplerGLSchema;
  preserveLayerOrder?: number[];
};

export function addDefaultLayers(
  state: VisState,
  datasets: Datasets
): {state: VisState; newLayers: Layer[]};
export function updateAllLayerDomainData(
  state: VisState,
  dataId: string | string[],
  updatedFilter?: Filter
): VisState;

export function updateStateWithLayerAndData(
  state: VisState,
  data: {layerData?: any; layer: Layer; idx: number}
): VisState;

export function layerConfigChangeUpdater(
  state: VisState,
  action: VisStateActions.LayerConfigChangeUpdaterAction
): VisState;
export function layerTextLabelChangeUpdater(
  state: VisState,
  action: VisStateActions.LayerTextLabelChangeUpdaterAction
): VisState;
export function layerDataIdChangeUpdater(
  state: VisState,
  action: {
    oldLayer: Layer;
    newConfig: {
      dataId: string;
    };
  }
): VisState;
export function layerTypeChangeUpdater(
  state: VisState,
  action: VisStateActions.LayerTypeChangeUpdaterAction
): VisState;
export function layerVisualChannelChangeUpdater(
  state: VisState,
  action: VisStateActions.LayerVisualChannelConfigChangeUpdaterAction
): VisState;
export function layerVisConfigChangeUpdater(
  state: VisState,
  action: VisStateActions.LayerVisConfigChangeUpdaterAction
): VisState;
export function layerColorUIChangeUpdater(
  state: VisState,
  action: VisStateActions.LayerColorUIChangeUpdaterAction
): VisState;
export function updateLayerBlendingUpdater(
  state: VisState,
  action: VisStateActions.UpdateLayerBlendingUpdaterAction
): VisState;
export function toggleLayerAnimationUpdater(
  state: VisState,
  action: VisStateActions.ToggleLayerAnimationUpdaterAction
): VisState;
export function toggleLayerAnimationControlUpdater(
  state: VisState,
  action: VisStateActions.ToggleLayerAnimationControlUpdaterAction
): VisState;
export function interactionConfigChangeUpdater(
  state: VisState,
  action: VisStateActions.InteractionConfigChangeUpdaterAction
): VisState;
export function setFilterUpdater(
  state: VisState,
  action: VisStateActions.SetFilterUpdaterAction
): VisState;
export function setFilterAnimationTimeUpdater(
  state: VisState,
  action: VisStateActions.setFilterAnimationTimeUpdaterAction
): VisState;
export function setFilterAnimationWindowUpdater(
  state: VisState,
  action: VisStateActions.setFilterAnimationWindowUpdaterAction
): VisState;
export function addFilterUpdater(
  state: VisState,
  action: VisStateActions.AddFilterUpdaterAction
): VisState;
export function addLayerUpdater(
  state: VisState,
  action: VisStateActions.AddLayerUpdaterAction
): VisState;
export function reorderLayerUpdater(
  state: VisState,
  action: VisStateActions.ReorderLayerUpdaterAction
): VisState;
export function removeFilterUpdater(
  state: VisState,
  action: VisStateActions.RemoveFilterUpdaterAction
): VisState;
export function removeLayerUpdater(
  state: VisState,
  action: VisStateActions.RemoveLayerUpdaterAction
): VisState;
export function duplicateLayerUpdater(
  state: VisState,
  action: VisStateActions.DuplicateLayerUpdaterAction
): VisState;
export function removeDatasetUpdater(
  state: VisState,
  action: VisStateActions.RemoveDatasetUpdaterAction
): VisState;
export function showDatasetTableUpdater(
  state: VisState,
  action: VisStateActions.ShowDatasetTableUpdaterAction
): VisState;
export function sortTableColumnUpdater(
  state: VisState,
  action: VisStateActions.SortTableColumnUpdaterAction
): VisState;
export function pinTableColumnUpdater(
  state: VisState,
  action: VisStateActions.PinTableColumnUpdaterAction
): VisState;
export function copyTableColumnUpdater(
  state: VisState,
  action: VisStateActions.CopyTableColumnUpdaterAction
): VisState;
export function updateVisDataUpdater(
  state: VisState,
  action: VisStateActions.UpdateVisDataUpdaterAction
): VisState;
export function renameDatasetUpdater(
  state: VisState,
  action: VisStateActions.RenameDatasetUpdaterAction
): VisState;
export function toggleFilterAnimationUpdater(
  state: VisState,
  action: VisStateActions.ToggleFilterAnimationUpdaterAction
): VisState;
export function updateFilterAnimationSpeedUpdater(
  state: VisState,
  action: VisStateActions.UpdateFilterAnimationSpeedUpdaterAction
): VisState;
export function setLayerAnimationTimeUpdater(
  state: VisState,
  action: VisStateActions.setLayerAnimationTimeUpdaterAction
): VisState;
export function updateLayerAnimationSpeedUpdater(
  state: VisState,
  action: VisStateActions.UpdateLayerAnimationSpeedUpdaterAction
): VisState;
export function enlargeFilterUpdater(
  state: VisState,
  action: VisStateActions.EnlargeFilterUpdaterAction
): VisState;
export function toggleFilterFeatureUpdater(
  state: VisState,
  action: VisStateActions.ToggleFilterFeatureUpdaterAction
): VisState;
export function layerHoverUpdater(
  state: VisState,
  action: VisStateActions.OnLayerHoverUpdaterAction
): VisState;
export function layerClickUpdater(
  state: VisState,
  action: VisStateActions.OnLayerClickUpdaterAction
): VisState;
export function mapClickUpdater(
  state: VisState,
  action: VisStateActions.OnMapClickUpdaterAction
): VisState;
export function mouseMoveUpdater(
  state: VisState,
  action: VisStateActions.OnMouseMoveUpdaterAction
): VisState;
export function toggleSplitMapUpdater(
  state: VisState,
  action: MapStateActions.ToggleSplitMapUpdaterAction
);
export function toggleLayerForMapUpdater(
  state: VisState,
  action: VisStateActions.ToggleLayerForMapUpdaterAction
): VisState;
export function setFilterPlotUpdater(
  state: VisState,
  action: VisStateActions.SetFilterPlotUpdaterAction
): VisState;
export function setMapInfoUpdater(
  state: VisState,
  action: VisStateActions.SetMapInfoUpdaterAction
): VisState;
export function loadFilesUpdater(
  state: VisState,
  action: VisStateActions.LoadFilesUpdaterAction
): VisState;
export function loadNextFileUpdater(state: VisState): VisState;
export function loadFilesSuccessUpdater(
  state: VisState,
  action: VisStateActions.loadFilesSuccessUpdaterAction
): VisState;
export function loadFilesErrUpdater(
  state: VisState,
  action: VisStateActions.LoadFilesErrUpdaterAction
): VisState;
export function loadFileStepSuccessUpdater(
  state: VisState,
  action: VisStateActions.LoadFileStepSuccessAction
): VisState;
export function nextFileBatchUpdater(
  state: VisState,
  action: VisStateActions.NextFileBatchUpdaterAction
): VisState;
export function processFileContentUpdater(
  state: VisState,
  action: VisStateActions.ProcessFileContentUpdaterAction
): VisState;
export function setFeaturesUpdater(
  state: VisState,
  action: VisStateActions.SetFeaturesUpdaterAction
): VisState;
export function setPolygonFilterLayerUpdater(
  state: VisState,
  action: VisStateActions.SetPolygonFilterLayerUpdaterAction
): VisState;
export function setSelectedFeatureUpdater(
  state: VisState,
  action: VisStateActions.SetSelectedFeatureUpdaterAction
): VisState;
export function deleteFeatureUpdater(
  state: VisState,
  action: VisStateActions.DeleteFeatureUpdaterAction
): VisState;
export function setEditorModeUpdater(
  state: VisState,
  action: VisStateActions.SetEditorModeUpdaterAction
): VisState;
export function applyCPUFilterUpdater(
  state: VisState,
  action: VisStateActions.ApplyCPUFilterUpdaterAction
): VisState;
export function toggleEditorVisibilityUpdater(
  state: VisState,
  action: VisStateActions.ToggleEditorVisibilityUpdaterAction
): VisState;

export function resetMapConfigUpdater(state: VisState): VisState;

export function setLayerAnimationTimeConfigUpdater(
  state: VisState,
  action: VisStateActions.setLayerAnimationTimeConfig
): VisState;

export function setFilterAnimationTimeConfigUpdater(
  state: VisState,
  action: VisStateActions.setFilterAnimationTimeConfig
): VisState;

export function receiveMapConfigUpdater(
  state: VisState,
  action: {
    type?: ActionTypes.RECEIVE_MAP_CONFIG;
    payload: ReceiveMapConfigPayload;
  }
): VisState;
export const INITIAL_VIS_STATE: VisState;
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig;
export const DEFAULT_EDITOR: Editor;

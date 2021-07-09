// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// vis-state-reducer
import ActionTypes, {ActionType} from 'constants/action-types';
import {ProtoDataset, AddDataToMapPayload} from '../actions/actions';
import {ParsedConfig} from '../schemas';
import {FileCacheItem} from '../processors/file-handler';
import {Layer, LayerConfig, LayerVisConfig} from 'layers';
import {Feature, InteractionConfig} from 'reducers/vis-state-updaters';
import {ValueOf, Merge} from '../reducers/types';
// TODO - import LoaderObject type from @loaders.gl/core when supported
// TODO - import LoadOptions type from @loaders.gl/core when supported
import {LoaderObject} from '@loaders.gl/loader-utils';

export type LayerConfigChangeUpdaterAction = {
  oldLayer: Layer;
  newConfig: Partial<LayerConfig>;
};

export function layerConfigChange(
  oldLayer: Layer,
  newConfig: Partial<LayerConfig>
): Merge<LayerConfigChangeUpdaterAction, {type: ActionTypes.LAYER_CONFIG_CHANGE}>;

export type LayerTextLabelChangeUpdaterAction = {
  oldLayer: Layer;
  idx: number | 'all';
  prop: string;
  value: any;
};

export function layerTextLabelChange(
  oldLayer: Layer,
  idx: number | 'all',
  prop: string,
  value: any
): Merge<LayerTextLabelChangeUpdaterAction, {type: ActionTypes.LAYER_TEXT_LABEL_CHANGE}>;

export type LayerTypeChangeUpdaterAction = {
  oldLayer: Layer;
  newType: string;
};
export function layerTypeChange(
  oldLayer: Layer,
  newType: string
): Merge<LayerTypeChangeUpdaterAction, {type: ActionTypes.LAYER_TYPE_CHANGE}>;

export type LayerVisualChannelConfigChangeUpdaterAction = {
  oldLayer: Layer;
  newConfig: Partial<LayerConfig>;
  channel: string;
};
export function layerVisualChannelConfigChange(
  oldLayer: Layer,
  newConfig: Partial<LayerConfig>,
  channel: string
): Merge<
  LayerVisualChannelConfigChangeUpdaterAction,
  {type: ActionTypes.LAYER_VISUAL_CHANNEL_CHANGE}
>;

export type LayerVisConfigChangeUpdaterAction = {
  oldLayer: Layer;
  newVisConfig: Partial<LayerVisConfig>;
};
export function layerVisConfigChange(
  oldLayer: Layer,
  newVisConfig: Partial<LayerVisConfig>
): Merge<LayerVisConfigChangeUpdaterAction, {type: ActionTypes.LAYER_VIS_CONFIG_CHANGE}>;

export type LayerColorUIChangeUpdaterAction = {
  oldLayer: Layer;
  prop: string;
  newConfig: object;
};
export function layerColorUIChange(
  oldLayer: Layer,
  prop: string,
  newConfig: object
): Merge<LayerColorUIChangeUpdaterAction, {type: ActionTypes.LAYER_COLOR_UI_CHANGE}>;

export type UpdateLayerBlendingUpdaterAction = {
  mode: string;
};
export function updateLayerBlending(
  mode: 'additive' | 'normal' | 'subtractive'
): Merge<UpdateLayerBlendingUpdaterAction, {type: ActionTypes.UPDATE_LAYER_BLENDING}>;

export type InteractionConfigChangeUpdaterAction = {
  config: ValueOf<InteractionConfig>;
};
export function interactionConfigChange(
  config: ValueOf<InteractionConfig>
): Merge<InteractionConfigChangeUpdaterAction, {type: ActionTypes.INTERACTION_CONFIG_CHANGE}>;

export type SetFilterUpdaterAction = {
  idx: number;
  prop: string;
  value: any;
  valueIndex?: number;
};
export function setFilter(
  idx: number,
  prop: string,
  value: any,
  valueIndex: number
): Merge<SetFilterUpdaterAction, {type: ActionTypes.SET_FILTER}>;


export type SetFilterAnimationTimeUpdaterAction = {
  idx: number;
  prop: string;
  value: any;
  valueIndex?: number;
};
export function setFilterAnimationTime(
  idx: number,
  prop: string,
  value: any,
  valueIndex?: number
): Merge<SetFilterAnimationTimeUpdaterAction, {type: ActionTypes.SET_FILTER_ANIMATION_TIME}>;

export type SetFilterAnimationWindowUpdaterAction = {
  id: string;
  animationWindow: string;
};
export function setFilterAnimationWindow({
  id: string,
  animationWindow: string,
}): Merge<SetFilterAnimationWindowUpdaterAction, {type: ActionTypes.SET_FILTER_ANIMATION_WINDOW}>;


export type AddFilterUpdaterAction = {
  dataId: string;
};
export function addFilter(
  dataId: string
): Merge<AddFilterUpdaterAction, {type: ActionTypes.ADD_FILTER}>;

export type AddLayerUpdaterAction = {
  config: object;
};
export function addLayer(
  config: object
): Merge<AddLayerUpdaterAction, {type: ActionTypes.ADD_LAYER}>;

export type ReorderLayerUpdaterAction = {
  order: number[];
};
export function reorderLayer(
  order: number[]
): Merge<ReorderLayerUpdaterAction, {type: ActionTypes.REORDER_LAYER}>;

export type RemoveFilterUpdaterAction = {
  idx: number;
};
export function removeFilter(
  idx: number
): Merge<RemoveFilterUpdaterAction, {type: ActionTypes.REMOVE_FILTER}>;

export type RemoveLayerUpdaterAction = {
  idx: number;
};
export function removeLayer(
  idx: number
): Merge<RemoveLayerUpdaterAction, {type: ActionTypes.REMOVE_LAYER}>;

export type DuplicateLayerUpdaterAction = {
  idx: number;
};
export function duplicateLayer(
  idx: number
): Merge<DuplicateLayerUpdaterAction, {type: ActionTypes.DUPLICATE_LAYER}>;

export type RemoveDatasetUpdaterAction = {
  dataId: string;
};
export function removeDataset(
  dataId: string
): Merge<RemoveDatasetUpdaterAction, {type: ActionTypes.REMOVE_DATASET}>;

export type ShowDatasetTableUpdaterAction = {
  dataId: string;
};
export function showDatasetTable(
  dataId: string
): Merge<ShowDatasetTableUpdaterAction, {type: ActionTypes.SHOW_DATASET_TABLE}>;

export type SortTableColumnUpdaterAction = {
  dataId: string;
  column: string;
  mode: string;
};
export function sortTableColumn(
  dataId: string,
  column: string,
  mode: string
): Merge<SortTableColumnUpdaterAction, {type: ActionTypes.SORT_TABLE_COLUMN}>;

export type PinTableColumnUpdaterAction = {
  dataId: string;
  column: string;
};
export function pinTableColumn(
  dataId: string,
  column: string
): Merge<PinTableColumnUpdaterAction, {type: ActionTypes.PIN_TABLE_COLUMN}>;

export type CopyTableColumnUpdaterAction = {
  dataId: string;
  column: string;
};
export function copyTableColumn(
  dataId: string,
  column: string
): Merge<CopyTableColumnUpdaterAction, {type: ActionTypes.COPY_TABLE_COLUMN}>;

export type AddDataToMapUpdaterOptions = {
  centrMap?: boolean;
  readOnly?: boolean;
  keepExistingConfig?: boolean;
};

export type UpdateVisDataUpdaterAction = {
  datasets: AddDataToMapPayload['datasets'];
  options: AddDataToMapPayload['options'];
  config: AddDataToMapPayload['config'];
} & AddDataToMapPayload;
export function updateVisData(
  datasets: AddDataToMapPayload['datasets'],
  options: AddDataToMapPayload['options'],
  config: AddDataToMapPayload['config']
): Merge<UpdateVisDataUpdaterAction, {type: ActionTypes.UPDATE_VIS_DATA}>;

export type RenameDatasetUpdaterAction = {
  dataId: string;
  label: string;
};
export function renameDataset(
  dataId: string, 
  label: string
): Merge<RenameDatasetUpdaterAction, {type: ActionTypes.RENAME_DATASET}>;

export type ToggleFilterAnimationUpdaterAction = {
  idx;
};
export function toggleFilterAnimation(
  idx: number
): Merge<ToggleFilterAnimationUpdaterAction, {type: ActionTypes.TOGGLE_FILTER_ANIMATION}>;

export type UpdateFilterAnimationSpeedUpdaterAction = {
  idx: number;
  speed: number;
};
export function updateFilterAnimationSpeed(
  idx: number,
  speed: number
): Merge<
  UpdateFilterAnimationSpeedUpdaterAction,
  {type: ActionTypes.UPDATE_FILTER_ANIMATION_SPEED}
>;

export type SetLayerAnimationTimeUpdaterAction = {
  value: number;
};
export function setLayerAnimationTime(
  value: number
): Merge<SetLayerAnimationTimeUpdaterAction, {type: ActionTypes.SET_LAYER_ANIMATION_TIME}>;

export type UpdateLayerAnimationSpeedUpdaterAction = {
  speed: number;
};
export function updateLayerAnimationSpeed(
  speed: number
): Merge<UpdateLayerAnimationSpeedUpdaterAction, {type: ActionTypes.UPDATE_LAYER_ANIMATION_SPEED}>;

export type ToggleLayerAnimationUpdaterAction = {};
export function toggleLayerAnimation(): 
  Merge<ToggleLayerAnimationUpdaterAction, {type: ActionTypes.TOGGLE_LAYER_ANIMATION}>;

export type ToggleLayerAnimationControlUpdaterAction = {};
export function toggleLayerAnimationControl(): 
  Merge<ToggleLayerAnimationControlUpdaterAction, {type: ActionTypes.TOGGLE_LAYER_ANIMATION_CONTROL}>;

export type EnlargeFilterUpdaterAction = {
  idx: number;
};
export function enlargeFilter(
  idx: number
): Merge<EnlargeFilterUpdaterAction, {type: ActionTypes.ENLARGE_FILTER}>;

export type ToggleFilterFeatureUpdaterAction = {
  idx: number;
};
export function toggleFilterFeature(
  idx: number
): Merge<ToggleFilterFeatureUpdaterAction, {type: ActionTypes.TOGGLE_FILTER_FEATURE}>;

export type OnLayerHoverUpdaterAction = {
  info: {picked?: boolean} | null;
};
export function onLayerHover(
  info: {picked?: boolean} | null
): Merge<OnLayerHoverUpdaterAction, {type: ActionTypes.LAYER_HOVER}>;

export type OnLayerClickUpdaterAction = {
  info: {picked?: boolean} | null;
};
export function onLayerClick(
  info: {picked?: boolean} | null
): Merge<OnLayerClickUpdaterAction, {type: ActionTypes.LAYER_CLICK}>;

export type OnMapClickUpdaterAction = {};

export function onMapClick(): Merge<OnMapClickUpdaterAction, {type: ActionTypes.MAP_CLICK}>;
export type OnMouseMoveUpdaterAction = {
  evt;
};
export function onMouseMove(evt): Merge<OnMouseMoveUpdaterAction, {type: ActionTypes.MOUSE_MOVE}>;

export type ToggleLayerForMapUpdaterAction = {
  mapIndex: number;
  layerId: string;
};
export function toggleLayerForMap(
  mapIndex: number,
  layerId: string
): Merge<ToggleLayerForMapUpdaterAction, {type: ActionTypes.TOGGLE_LAYER_FOR_MAP}>;

export type SetFilterPlotUpdaterAction = {
  idx: number;
  newProp: object;
  valueIndex?: number;
};
export function setFilterPlot(
  idx: number,
  newProp: object,
  valueIndex?: number
): Merge<SetFilterPlotUpdaterAction, {type: ActionTypes.SET_FILTER_PLOT}>;

export type SetMapInfoUpdaterAction = {
  info: any;
};
export function setMapInfo(
  info: any
): Merge<SetMapInfoUpdaterAction, {type: ActionTypes.SET_MAP_INFO}>;

export type LoadFilesUpdaterAction = {
  files: File[];
  onFinish?(result: any): any;
};
export function loadFiles(
  files: File[],
  onFinish?: (result: any) => any
): Merge<LoadFilesUpdaterAction, {type: ActionTypes.LOAD_FILES}>;

export type SetFeaturesUpdaterAction = {
  features: Feature[];
};
export function setFeatures(
  features: Feature[]
): Merge<SetFeaturesUpdaterAction, {type: ActionTypes.SET_FEATURES}>;

export type SetPolygonFilterLayerUpdaterAction = {
  layer: Layer;
  feature: Feature;
};
export function setPolygonFilterLayer(
  layer: Layer,
  feature: Feature
): Merge<SetPolygonFilterLayerUpdaterAction, {type: ActionTypes.SET_POLYGON_FILTER_LAYER}>;

export type SetSelectedFeatureUpdaterAction = {
  feature: Feature;
};
export function setSelectedFeature(
  feature: Feature
): Merge<SetSelectedFeatureUpdaterAction, {type: ActionTypes.SET_SELECTED_FEATURE}>;

export type DeleteFeatureUpdaterAction = {
  feature: Feature;
};
export function deleteFeature(
  feature: Feature
): Merge<DeleteFeatureUpdaterAction, {type: ActionTypes.DELETE_FEATURE}>;

export type SetEditorModeUpdaterAction = {
  mode: string;
};
export function setEditorMode(
  mode: string
): Merge<SetEditorModeUpdaterAction, {type: ActionTypes.SET_EDITOR_MODE}>;

export type ApplyCPUFilterUpdaterAction = {
  dataId: string | string[];
};
export function applyCPUFilter(
  dataId: string | string[]
): Merge<ApplyCPUFilterUpdaterAction, {type: ActionTypes.APPLY_CPU_FILTER}>;

export type ToggleEditorVisibilityUpdaterAction = {};
export function toggleEditorVisibility(): Merge<
  ToggleEditorVisibilityUpdaterAction,
  {type: ActionTypes.TOGGLE_EDITOR_VISIBILITY}
>;

export function loadNextFile(): Merge<{type: ActionTypes.LOAD_NEXT_FILE}>;

export type loadFilesSuccessUpdaterAction = {
  result: FileCacheItem[];
};
export function loadFilesSuccess(
  result: FileCacheItem[]
): Merge<loadFilesSuccessUpdaterAction, {type: ActionTypes.LOAD_FILES_SUCCESS}>;

export type loadFilesErrUpdaterAction = {
  fileName: string;
  error: any;
};
export function loadFilesErr(
  fileName: string,
  error: any
): Merge<loadFilesErrUpdaterAction, {type: ActionTypes.LOAD_FILES_ERR}>;

export type LoadFileStepSuccessAction = {
  fileName: string;
  fileCache: FileCacheItem[];
};
export function loadFileStepSuccess(payload: {
  fileName: string;
  fileCache: FileCacheItem[];
}): Merge<LoadFileStepSuccessAction, {type: ActionTypes.LOAD_FILE_STEP_SUCCESS}>;

type FileContent = {
  fileName: string;
  header: string[];
  data: any;
};
export type NextFileBatchUpdaterAction = {
  payload: {
    gen: AsyncGenerator<FileContent>;
    fileName: string;
    progress?: any;
    accumulated?: any;
    onFinish: (result: any) => any;
  };
};
export function nextFileBatch(
  payload: NextFileBatchAction['payload']
): Merge<NextFileBatchUpdaterAction, {type: ActionTypes.NEXT_FILE_BATCH}>;

export type ProcessFileContentUpdaterAction = {
  payload: {
    content: FileContent;
    fileCache: FileCacheItem[];
  };
};

export function processFileContent(
  payload: ProcessFileContentUpdaterAction['payload']
): Merge<ProcessFileContentUpdaterAction, {type: ActionTypes.PROCESS_FILE_CONTENT}>;

export type SetLayerAnimationTimeConfigAction = {
  config: {
    timezone?: string;
    timeFormat?: string;
  };
};

export function setLayerAnimationTimeConfig(
  config: SetLayerAnimationTimeConfigAction['config']
): Merge<SetLayerAnimationTimeConfigAction, {type: ActionTypes.SET_TIME_FORMAT}>;

export type SetFilterAnimationTimeConfigAction = {
  idx: number;
  config: {
    timezone?: string;
    timeFormat?: string;
  };
}
export function setFilterAnimationTimeConfig(
  idx: SetFilterAnimationTimeConfigAction['idx'],
  config: SetFilterAnimationTimeConfigAction['config']
): Merge<timeFormatAction, {type: ActionTypes.SET_TIME_FORMAT}>;

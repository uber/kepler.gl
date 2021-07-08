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

import ActionTypes from 'constants/action-types';
import {ParsedConfig} from '../schemas';
import {RGBColor} from 'reducers/types';
import {Bounds} from 'reducers/map-state-updaters';
import {MapInfo} from 'reducers/vis-state-updaters';
import {UiState} from 'reducers/ui-state-updaters';

/**
 * Input dataest parsed to addDataToMap
 */
export type ProtoDataset = {
  info: {
    id?: string;
    label?: string;
    format?: string;
    color?: RGBColor;
  };
  data: {
    fields: {
      name: string;
      type?: string;
      format?: string;
      displayName?: string;
      id?: string;
    }[];
    rows: any[][];
  };

  // table-injected metadata
  metadata?: any;
};

export type AddDataToMapOptions = {
  centerMap?: boolean;
  readOnly?: boolean;
  keepExistingConfig?: boolean;
  autoCreateLayers?: boolean;
};

export type AddDataToMapPayload = {
  // TODO/ib - internally the code calls `toArray` a couple of layers deep
  // so this function can actually accept both an array and an object
  // recommend dropping such "sloppy typing" and enforcing array type
  // as the field is called `datasets`
  datasets: ProtoDataset[] | ProtoDataset;
  options?: AddDataToMapOptions;
  config?: ParsedConfig;
  info?: Partial<MapInfo>;
};

export function addDataToMap(
  data: AddDataToMapPayload
): {type: ActionTypes.ADD_DATA_TO_MAP; payload: AddDataToMapPayload};

export function resetMapConfig(): {type: ActionTypes.RESET_MAP_CONFIG};

export type ReceiveMapConfigPayload = {
  config: ParsedConfig;
  options?: AddDataToMapOptions;
  bounds?: Bounds;
};

export function receiveMapConfig(
  config: ParsedConfig,
  options: AddDataToMapOptions
): {
  type: ActionTypes.RECEIVE_MAP_CONFIG;
  payload: ReceiveMapConfigPayload;
};

export type KeplerGlInitPayload = {
  mapboxApiAccessToken?: string;
  mapboxApiUrl?: string;
  mapStylesReplaceDefault?: boolean;
  initialUiState?: Partial<UiState>;
};

export function keplerGlInit(
  options?: KeplerGlInitPayload
): {
  type: ActionTypes.INIT;
  payload: KeplerGlInitPayload;
};

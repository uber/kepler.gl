// Copyright (c) 2021 Uber Technologies, Inc.
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

import {ScenegraphLayer as DeckScenegraphLayer} from '@deck.gl/mesh-layers';
import {load} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';

import Layer from '../base-layer';
import ScenegraphLayerIcon from './scenegraph-layer-icon';
import ScenegraphInfoModalFactory from './scenegraph-info-modal';
import {LAYER_VIS_CONFIGS} from 'layers/layer-factory';

export const scenegraphRequiredColumns = ['lat', 'lng'];
export const scenegraphOptionalColumns = ['altitude'];

function fetch(url, {propName, layer}) {
  if (propName === 'scenegraph') {
    return load(url, GLTFLoader, layer.getLoadOptions());
  }

  return fetch(url).then(response => response.json());
}

export const scenegraphPosAccessor = ({lat, lng, altitude}) => d => {
  if (d.refDataContainer) {
    return [
      d.refDataContainer.valueAt(d.index, lng.fieldIdx),
      d.refDataContainer.valueAt(d.index, lat.fieldIdx),
      altitude && altitude.fieldIdx > -1
        ? d.refDataContainer.valueAt(d.index, altitude.fieldIdx)
        : 0
    ];
  }
};

export const scenegraphVisConfigs = {
  opacity: 'opacity',
  colorRange: 'colorRange',
  //
  sizeScale: 'sizeScale',
  angleX: {
    ...LAYER_VIS_CONFIGS.angle,
    property: 'angleX',
    label: 'angle X'
  },
  angleY: {
    ...LAYER_VIS_CONFIGS.angle,
    property: 'angleY',
    label: 'angle Y'
  },
  angleZ: {
    ...LAYER_VIS_CONFIGS.angle,
    property: 'angleZ',
    defaultValue: 90,
    label: 'angle Z'
  }
};

const DEFAULT_MODEL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
const DEFAULT_TRANSITION = [0, 0, 0];
const DEFAULT_SCALE = [1, 1, 1];
const DEFAULT_COLOR = [255, 255, 255, 255];

export default class ScenegraphLayer extends Layer {
  constructor(props) {
    super(props);

    this.registerVisConfig(scenegraphVisConfigs);
    this.getPositionAccessor = () => scenegraphPosAccessor(this.config.columns);

    // prepare layer info modal
    this._layerInfoModal = ScenegraphInfoModalFactory();
  }

  get type() {
    return '3D';
  }

  get requiredLayerColumns() {
    return scenegraphRequiredColumns;
  }

  get optionalColumns() {
    return scenegraphOptionalColumns;
  }

  get columnPairs() {
    return this.defaultPointColumnPairs;
  }

  get layerIcon() {
    return ScenegraphLayerIcon;
  }

  get layerInfoModal() {
    return {
      id: 'scenegraphInfo',
      template: this._layerInfoModal,
      modalProps: {
        title: 'How to use Scenegraph'
      }
    };
  }

  calculateDataAttribute({dataContainer, filteredIndex}, getPosition) {
    const data = [];

    for (let i = 0; i < filteredIndex.length; i++) {
      const index = filteredIndex[i];
      const pos = getPosition({refDataContainer: dataContainer, index});

      // if doesn't have point lat or lng, do not add the point
      // deck.gl can't handle position = null
      if (pos.every(Number.isFinite)) {
        data.push({
          refDataContainer: dataContainer,
          position: pos,
          // index is important for filter
          index
        });
      }
    }
    return data;
  }

  formatLayerData(datasets, oldLayerData) {
    const {gpuFilter} = datasets[this.config.dataId];
    const {data} = this.updateData(datasets, oldLayerData);
    const getPosition = this.getPositionAccessor();
    return {
      data,
      getPosition,
      getFilterValue: gpuFilter.filterValueAccessor()
    };
  }

  updateLayerMeta(dataContainer, getPosition) {
    const bounds = this.getPointsBounds(dataContainer, (d, i) =>
      getPosition({refDataContainer: dataContainer, index: i})
    );
    this.updateMeta({bounds});
  }

  renderLayer(opts) {
    const {data, gpuFilter} = opts;

    const {
      visConfig: {sizeScale = 1, angleX = 0, angleY = 0, angleZ = 90}
    } = this.config;

    return [
      new DeckScenegraphLayer({
        ...this.getDefaultDeckLayerProps(opts),
        ...data,
        fetch,
        scenegraph: this.config.visConfig.scenegraph || DEFAULT_MODEL,
        sizeScale,
        getTranslation: DEFAULT_TRANSITION,
        getScale: DEFAULT_SCALE,
        getOrientation: [angleX, angleY, angleZ],
        getColor: DEFAULT_COLOR,
        // parameters
        parameters: {depthTest: true, blend: false},
        // update triggers
        updateTriggers: {
          getOrientation: {angleX, angleY, angleZ},
          getPosition: this.config.columns,
          getFilterValue: gpuFilter.filterValueUpdateTriggers
        }
      })
    ];
  }
}

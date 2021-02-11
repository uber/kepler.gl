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

import {OVERLAY_TYPE} from './base-layer';

/** @typedef {import("geojson").FeatureCollection} FeatureCollection */
/** @typedef {import("geojson").Feature} Feature */

/**
 * This function will convert layers to mapbox layers
 * @param {Array<Object>} layers the layers to be converted
 * @param {Array<Object>} layerData extra layer information
 * @param {Array<Number>} layerOrder the order by which we should convert layers
 * @param {Object} layersToRender {[id]: true | false} object whether each layer should be rendered
 * @returns {Object} {[id]: layer}
 */
export function generateMapboxLayers(
  layers = [],
  layerData = [],
  layerOrder = [],
  layersToRender = {}
) {
  if (layerData.length > 0) {
    return layerOrder
      .slice()
      .reverse()
      .filter(
        idx => layers[idx].overlayType === OVERLAY_TYPE.mapboxgl && layersToRender[layers[idx].id]
      )
      .reduce((accu, index) => {
        const layer = layers[index];
        return {
          ...accu,
          [layer.id]: {
            id: layer.id,
            data: layerData[index].data,
            isVisible: layer.config.isVisible,
            config: layerData[index].config,
            hidden: layer.config.hidden,
            sourceId: layerData[index].config.source
          }
        };
      }, {});
  }

  return {};
}

/**
 * Update mapbox layers on the given map
 * @param {Object} map
 * @param {Object} newLayers Map of new mapbox layers to be displayed
 * @param {Object} oldLayers Map of the old layers to be compare with the current ones to detect deleted layers
 *                  {layerId: sourceId}
 */
export function updateMapboxLayers(map, newLayers = {}, oldLayers = null) {
  // delete no longer existed old layers
  if (oldLayers) {
    checkAndRemoveOldLayers(map, oldLayers, newLayers);
  }

  // insert or update new layer
  Object.values(newLayers).forEach(overlay => {
    const {id: layerId, config, data, sourceId, isVisible} = overlay;
    if (!data && !config) {
      return;
    }

    const {data: oldData, config: oldConfig} = (oldLayers && oldLayers[layerId]) || {};

    if (data && data !== oldData) {
      updateSourceData(map, sourceId, data);
    }

    // compare with previous configs
    if (oldConfig !== config) {
      updateLayerConfig(map, layerId, config, isVisible);
    }
  });
}

function checkAndRemoveOldLayers(map, oldLayers, newLayers) {
  Object.keys(oldLayers).forEach(layerId => {
    if (!newLayers[layerId]) {
      map.removeLayer(layerId);
    }
  });
}

function updateLayerConfig(map, layerId, config, isVisible) {
  const mapboxLayer = map.getLayer(layerId);

  if (mapboxLayer) {
    // check if layer already is set
    // remove it if exists
    map.removeLayer(layerId);
  }

  map.addLayer(config);
  map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
}

function updateSourceData(map, sourceId, data) {
  const source = map.getSource(sourceId);

  if (!source) {
    map.addSource(sourceId, {
      type: 'geojson',
      data
    });
  } else {
    source.setData(data);
  }
}
/**
 *
 * @param dataContainer DataContainer
 * @param filteredIndex
 * @param getGeometry {(point: any) => any}
 * @param getProperties {(point: any, index: number) => any}
 * @returns FeatureCollection
 */
export function geoJsonFromData(
  dataContainer,
  filteredIndex = [],
  getGeometry,
  getProperties = (d, i) => {}
) {
  const geojson = {
    type: 'FeatureCollection',
    /** @type {Feature[]} */
    features: []
  };

  for (let i = 0; i < filteredIndex.length; i++) {
    const index = filteredIndex[i];
    const point = dataContainer.row(index);
    const geometry = getGeometry(point);

    if (geometry) {
      geojson.features.push({
        type: 'Feature',
        properties: {
          index,
          ...getProperties(point, index)
        },
        geometry
      });
    }
  }

  return geojson;
}

export const prefixGpuField = name => `gpu:${name}`;

export function gpuFilterToMapboxFilter(gpuFilter) {
  const {filterRange, filterValueUpdateTriggers} = gpuFilter;

  const hasFilter = Object.values(filterValueUpdateTriggers).filter(d => d);

  if (!hasFilter.length) {
    return null;
  }

  const condition = ['all'];

  // [">=", key, value]
  // ["<=", key, value]
  const expressions = Object.values(filterValueUpdateTriggers).reduce(
    (accu, name, i) =>
      name
        ? [
            ...accu,
            ['>=', prefixGpuField(name), filterRange[i][0]],
            ['<=', prefixGpuField(name), filterRange[i][1]]
          ]
        : accu,
    condition
  );

  return expressions;
}

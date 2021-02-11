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

/**
 * Find default layers from fields
 * @type {typeof import('./layer-utils').findDefaultLayer}
 */
export function findDefaultLayer(dataset, layerClasses) {
  if (!dataset) {
    return [];
  }
  const layerProps = Object.keys(layerClasses).reduce((previous, lc) => {
    const result =
      typeof layerClasses[lc].findDefaultLayerProps === 'function'
        ? layerClasses[lc].findDefaultLayerProps(dataset, previous)
        : {props: []};

    const props = Array.isArray(result) ? result : result.props || [];
    const foundLayers = result.foundLayers || previous;

    return foundLayers.concat(
      props.map(p => ({
        ...p,
        type: lc,
        dataId: dataset.id
      }))
    );
  }, []);

  // go through all layerProps to create layer
  return layerProps.map(props => {
    const layer = new layerClasses[props.type](props);
    return typeof layer.setInitialLayerConfig === 'function' &&
      dataset.dataContainer &&
      dataset.dataContainer.numRows // TODO is data container
      ? layer.setInitialLayerConfig(dataset)
      : layer;
  });
}

/**
 * calculate layer data based on layer type, col Config,
 * return updated layer if colorDomain, dataMap has changed
 * @type {typeof import('./layer-utils').calculateLayerData}
 */
export function calculateLayerData(layer, state, oldLayerData) {
  const {type} = layer;

  if (!type || !layer.hasAllColumns() || !layer.config.dataId) {
    return {layer, layerData: {}};
  }

  const layerData = layer.formatLayerData(state.datasets, oldLayerData);
  return {layerData, layer};
}

/**
 * Calculate props passed to LayerHoverInfo
 * @type {typeof import('./layer-utils').getLayerHoverProp}
 */
export function getLayerHoverProp({
  interactionConfig,
  hoverInfo,
  layers,
  layersToRender,
  datasets
}) {
  if (interactionConfig.tooltip.enabled && hoverInfo && hoverInfo.picked) {
    // if anything hovered
    const {object, layer: overlay} = hoverInfo;

    // deckgl layer to kepler-gl layer
    const layer = layers[overlay.props.idx];

    if (object && layer && layer.getHoverData && layersToRender[layer.id]) {
      // if layer is visible and have hovered data
      const {
        config: {dataId}
      } = layer;
      if (!dataId) {
        return null;
      }
      const {dataContainer, fields} = datasets[dataId];
      const data = layer.getHoverData(object, dataContainer, fields);
      const fieldsToShow = interactionConfig.tooltip.config.fieldsToShow[dataId];

      return {
        data,
        fields,
        fieldsToShow,
        layer
      };
    }
  }

  return null;
}

export function renderDeckGlLayer(props, layerCallbacks, idx) {
  const {
    datasets,
    layers,
    layerData,
    hoverInfo,
    clicked,
    mapState,
    interactionConfig,
    animationConfig
  } = props;
  const layer = layers[idx];
  const data = layerData[idx];
  const {gpuFilter} = datasets[layer.config.dataId] || {};

  const objectHovered = clicked || hoverInfo;

  // Layer is Layer class
  return layer.renderLayer({
    data,
    gpuFilter,
    idx,
    interactionConfig,
    layerCallbacks,
    mapState,
    animationConfig,
    objectHovered
  });
}

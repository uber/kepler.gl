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

import Layer from '../base-layer';
import {findDefaultColorField} from 'utils/dataset-utils';
import {GeoJsonLayer} from '@deck.gl/layers';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import EnhancedColumnLayer from 'deckgl-layers/column-layer/enhanced-column-layer';
import {getCentroid, idToPolygonGeo, h3IsValid, getHexFields} from './h3-utils';
import H3HexagonLayerIcon from './h3-hexagon-layer-icon';
import {CHANNEL_SCALES, HIGHLIGH_COLOR_3D} from 'constants/default-settings';

import {createDataContainer} from '../../utils/table-utils';

const DEFAULT_LINE_SCALE_VALUE = 8;

export const hexIdRequiredColumns = ['hex_id'];
export const hexIdAccessor = ({hex_id}) => d => {
  if (d.refDataContainer) {
    return d.refDataContainer.valueAt(d.index, hex_id.fieldIdx);
  }

  // TODO Still getting rows here...
  return d.data.valueAt(hex_id.fieldIdx);
};
export const defaultElevation = 500;
export const defaultCoverage = 1;

export const HexagonIdVisConfigs = {
  opacity: 'opacity',
  colorRange: 'colorRange',
  coverage: 'coverage',
  enable3d: 'enable3d',
  sizeRange: 'elevationRange',
  coverageRange: 'coverageRange',
  elevationScale: 'elevationScale'
};

export default class HexagonIdLayer extends Layer {
  constructor(props) {
    super(props);
    this.registerVisConfig(HexagonIdVisConfigs);
    this.getPositionAccessor = () => hexIdAccessor(this.config.columns);
  }

  get type() {
    return 'hexagonId';
  }

  get name() {
    return 'H3';
  }

  get requiredLayerColumns() {
    return hexIdRequiredColumns;
  }

  get layerIcon() {
    // use hexagon layer icon for now
    return H3HexagonLayerIcon;
  }

  get visualChannels() {
    const visualChannels = super.visualChannels;
    return {
      color: {
        ...visualChannels.color,
        accessor: 'getFillColor'
      },
      size: {
        ...visualChannels.size,
        property: 'height',
        accessor: 'getElevation',
        nullValue: 0,
        condition: config => config.visConfig.enable3d,
        defaultValue: defaultElevation
      },
      coverage: {
        property: 'coverage',
        field: 'coverageField',
        scale: 'coverageScale',
        domain: 'coverageDomain',
        range: 'coverageRange',
        key: 'coverage',
        channelScaleType: CHANNEL_SCALES.radius,
        accessor: 'getCoverage',
        nullValue: 0,
        defaultValue: defaultCoverage
      }
    };
  }

  setInitialLayerConfig(dataset) {
    const defaultColorField = findDefaultColorField(dataset);

    if (defaultColorField) {
      this.updateLayerConfig({
        colorField: defaultColorField
      });
      this.updateLayerVisualChannel(dataset, 'color');
    }

    return this;
  }

  static findDefaultLayerProps({fields = [], dataContainer}) {
    const hexFields = getHexFields(fields, dataContainer);
    if (!hexFields.length) {
      return {props: []};
    }

    return {
      props: hexFields.map(f => ({
        isVisible: true,
        label: f.displayName || f.name,
        columns: {
          hex_id: {
            value: f.name,
            fieldIdx: fields.findIndex(fid => fid.name === f.name)
          }
        }
      }))
    };
  }

  getDefaultLayerConfig(props = {}) {
    return {
      ...super.getDefaultLayerConfig(props),

      // add height visual channel
      coverageField: null,
      coverageDomain: [0, 1],
      coverageScale: 'linear'
    };
  }

  calculateDataAttribute({dataContainer, filteredIndex}, getHexId) {
    const data = [];

    for (let i = 0; i < filteredIndex.length; i++) {
      const index = filteredIndex[i];
      const id = getHexId({data: dataContainer.row(index)}); // TODO shared rows
      const centroid = this.dataToFeature.centroids[index];

      if (centroid) {
        data.push({
          // keep a reference to the original data index
          index,
          refDataContainer: dataContainer,
          id,
          centroid
        });
      }
    }
    return data;
  }

  // TODO: fix complexity
  /* eslint-disable complexity */
  formatLayerData(datasets, oldLayerData, opt = {}) {
    const {gpuFilter} = datasets[this.config.dataId];
    const getHexId = this.getPositionAccessor();
    const {data} = this.updateData(datasets, oldLayerData);
    const accessors = this.getAttributeAccessors();

    return {
      data,
      getHexId,
      getFilterValue: gpuFilter.filterValueAccessor(),
      ...accessors
    };
  }
  /* eslint-enable complexity */

  updateLayerMeta(dataContainer, getHexId) {
    // TODO use shared rows here
    const centroids = dataContainer.map((d, index) => {
      const id = getHexId({data: d});
      if (!h3IsValid(id)) {
        return null;
      }
      // save a reference of centroids to dataToFeature
      // so we don't have to re calculate it again
      return getCentroid({id});
    });

    const centroidsDataContainer = createDataContainer(centroids, {fields: ['x', 'y']});

    const bounds = this.getPointsBounds(centroidsDataContainer);
    this.dataToFeature = {centroids};
    this.updateMeta({bounds});
  }

  renderLayer(opts) {
    const {data, gpuFilter, objectHovered, mapState} = opts;

    const zoomFactor = this.getZoomFactor(mapState);
    const eleZoomFactor = this.getElevationZoomFactor(mapState);
    const {config} = this;
    const {visConfig} = config;
    const updateTriggers = this.getVisualChannelUpdateTriggers();

    const h3HexagonLayerTriggers = {
      getHexagon: this.config.columns,
      getFillColor: updateTriggers.getFillColor,
      getElevation: updateTriggers.getElevation,
      getFilterValue: gpuFilter.filterValueUpdateTriggers
    };

    const columnLayerTriggers = {
      getCoverage: updateTriggers.getCoverage
    };

    const defaultLayerProps = this.getDefaultDeckLayerProps(opts);
    const hoveredObject = this.hasHoveredObject(objectHovered);

    return [
      new H3HexagonLayer({
        ...defaultLayerProps,
        ...data,
        wrapLongitude: false,

        getHexagon: x => x.id,

        // coverage
        coverage: config.coverageField ? 1 : visConfig.coverage,

        // highlight
        autoHighlight: visConfig.enable3d,
        highlightColor: HIGHLIGH_COLOR_3D,

        // elevation
        extruded: visConfig.enable3d,
        elevationScale: visConfig.elevationScale * eleZoomFactor,

        // render
        updateTriggers: h3HexagonLayerTriggers,
        _subLayerProps: {
          'hexagon-cell': {
            type: EnhancedColumnLayer,
            getCoverage: data.getCoverage,
            updateTriggers: columnLayerTriggers
          }
        }
      }),
      ...(hoveredObject && !config.sizeField
        ? [
            new GeoJsonLayer({
              ...this.getDefaultHoverLayerProps(),
              data: [idToPolygonGeo(hoveredObject)],
              getLineColor: config.highlightColor,
              lineWidthScale: DEFAULT_LINE_SCALE_VALUE * zoomFactor,
              wrapLongitude: false
            })
          ]
        : [])
    ];
  }
}

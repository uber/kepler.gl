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

import {BrushingExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';

import Layer from '../base-layer';
import {hexToRgb} from 'utils/color-utils';
import {findDefaultColorField} from 'utils/dataset-utils';
import PointLayerIcon from './point-layer-icon';
import {DEFAULT_LAYER_COLOR, CHANNEL_SCALES} from 'constants/default-settings';

import {getTextOffsetByRadius, formatTextLabelData} from '../layer-text-label';

export const pointPosAccessor = ({lat, lng, altitude}) => d => {
  if (d.refDataContainer) {
    return [
      d.refDataContainer.valueAt(d.index, lng.fieldIdx),
      d.refDataContainer.valueAt(d.index, lat.fieldIdx),
      altitude && altitude.fieldIdx > -1
        ? d.refDataContainer.valueAt(d.index, altitude.fieldIdx)
        : 0
    ];
  }

  // ! again, accessor is used on prepared rows
  return [
    // lng
    d.data.valueAt(lng.fieldIdx),
    // lat
    d.data.valueAt(lat.fieldIdx),
    altitude && altitude.fieldIdx > -1 ? d.data.valueAt(altitude.fieldIdx) : 0
  ];
};

export const pointRequiredColumns = ['lat', 'lng'];
export const pointOptionalColumns = ['altitude'];

const brushingExtension = new BrushingExtension();

export const pointVisConfigs = {
  radius: 'radius',
  fixedRadius: 'fixedRadius',
  opacity: 'opacity',
  outline: 'outline',
  thickness: 'thickness',
  strokeColor: 'strokeColor',
  colorRange: 'colorRange',
  strokeColorRange: 'strokeColorRange',
  radiusRange: 'radiusRange',
  filled: {
    type: 'boolean',
    label: 'layer.fillColor',
    defaultValue: true,
    property: 'filled'
  }
};

export default class PointLayer extends Layer {
  constructor(props) {
    super(props);

    this.registerVisConfig(pointVisConfigs);
    this.getPositionAccessor = () => pointPosAccessor(this.config.columns);
  }

  get type() {
    return 'point';
  }

  get isAggregated() {
    return false;
  }

  get layerIcon() {
    return PointLayerIcon;
  }
  get requiredLayerColumns() {
    return pointRequiredColumns;
  }

  get optionalColumns() {
    return pointOptionalColumns;
  }

  get columnPairs() {
    return this.defaultPointColumnPairs;
  }

  get noneLayerDataAffectingProps() {
    return [...super.noneLayerDataAffectingProps, 'radius'];
  }

  get visualChannels() {
    return {
      color: {
        ...super.visualChannels.color,
        accessor: 'getFillColor',
        condition: config => config.visConfig.filled,
        defaultValue: config => config.color
      },
      strokeColor: {
        property: 'strokeColor',
        key: 'strokeColor',
        field: 'strokeColorField',
        scale: 'strokeColorScale',
        domain: 'strokeColorDomain',
        range: 'strokeColorRange',
        channelScaleType: CHANNEL_SCALES.color,
        accessor: 'getLineColor',
        condition: config => config.visConfig.outline,
        defaultValue: config => config.visConfig.strokeColor || config.color
      },
      size: {
        ...super.visualChannels.size,
        property: 'radius',
        range: 'radiusRange',
        fixed: 'fixedRadius',
        channelScaleType: 'radius',
        accessor: 'getRadius',
        defaultValue: 1
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

  static findDefaultLayerProps({fieldPairs = []}) {
    const props = [];

    // Make layer for each pair
    fieldPairs.forEach(pair => {
      const latField = pair.pair.lat;
      const lngField = pair.pair.lng;
      const layerName = pair.defaultName;

      const prop = {
        label: layerName.length ? layerName : 'Point'
      };

      // default layer color for begintrip and dropoff point
      if (latField.value in DEFAULT_LAYER_COLOR) {
        prop.color = hexToRgb(DEFAULT_LAYER_COLOR[latField.value]);
      }

      // set the first layer to be visible
      if (props.length === 0) {
        prop.isVisible = true;
      }

      prop.columns = {
        lat: latField,
        lng: lngField,
        altitude: {value: null, fieldIdx: -1, optional: true}
      };

      props.push(prop);
    });

    return {props};
  }

  getDefaultLayerConfig(props = {}) {
    return {
      ...super.getDefaultLayerConfig(props),

      // add stroke color visual channel
      strokeColorField: null,
      strokeColorDomain: [0, 1],
      strokeColorScale: 'quantile'
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
          refDataContainer: dataContainer, // this is definitely not needed in attribute, but how to pass it everywhere?
          position: pos,
          // index is important for filter
          index
        });
      }
    }
    return data;
  }

  formatLayerData(datasets, oldLayerData) {
    const {textLabel} = this.config;
    const {gpuFilter} = datasets[this.config.dataId];
    const {data, triggerChanged} = this.updateData(datasets, oldLayerData);
    const getPosition = this.getPositionAccessor();

    // get all distinct characters in the text labels
    const textLabels = formatTextLabelData({
      textLabel,
      triggerChanged,
      oldLayerData,
      data
    });

    const accessors = this.getAttributeAccessors();

    return {
      data,
      getPosition,
      getFilterValue: gpuFilter.filterValueAccessor(),
      textLabels,
      ...accessors
    };
  }
  /* eslint-enable complexity */

  updateLayerMeta(dataContainer) {
    const getPosition = this.getPositionAccessor();
    const bounds = this.getPointsBounds(dataContainer, (d, i) =>
      getPosition({refDataContainer: dataContainer, index: i})
    );
    this.updateMeta({bounds});
  }

  renderLayer(opts) {
    const {data, gpuFilter, objectHovered, mapState, interactionConfig} = opts;

    // if no field size is defined we need to pass fixed radius = false
    const fixedRadius = this.config.visConfig.fixedRadius && Boolean(this.config.sizeField);
    const radiusScale = this.getRadiusScaleByZoom(mapState, fixedRadius);

    const layerProps = {
      stroked: this.config.visConfig.outline,
      filled: this.config.visConfig.filled,
      lineWidthScale: this.config.visConfig.thickness,
      radiusScale,
      ...(this.config.visConfig.fixedRadius ? {} : {radiusMaxPixels: 500})
    };

    const updateTriggers = {
      getPosition: this.config.columns,
      getFilterValue: gpuFilter.filterValueUpdateTriggers,
      ...this.getVisualChannelUpdateTriggers()
    };

    const defaultLayerProps = this.getDefaultDeckLayerProps(opts);
    const brushingProps = this.getBrushingExtensionProps(interactionConfig);
    const getPixelOffset = getTextOffsetByRadius(radiusScale, data.getRadius, mapState);
    const extensions = [...defaultLayerProps.extensions, brushingExtension];

    const sharedProps = {
      getFilterValue: data.getFilterValue,
      extensions,
      filterRange: defaultLayerProps.filterRange,
      ...brushingProps
    };
    const hoveredObject = this.hasHoveredObject(objectHovered);

    return [
      new ScatterplotLayer({
        ...defaultLayerProps,
        ...brushingProps,
        ...layerProps,
        ...data,
        parameters: {
          // circles will be flat on the map when the altitude column is not used
          depthTest: this.config.columns.altitude.fieldIdx > -1
        },
        lineWidthUnits: 'pixels',
        updateTriggers,
        extensions
      }),
      // hover layer
      ...(hoveredObject
        ? [
            new ScatterplotLayer({
              ...this.getDefaultHoverLayerProps(),
              ...layerProps,
              data: [hoveredObject],
              getLineColor: this.config.highlightColor,
              getFillColor: this.config.highlightColor,
              getRadius: data.getRadius,
              getPosition: data.getPosition
            })
          ]
        : []),
      // text label layer
      ...this.renderTextLabelLayer(
        {
          getPosition: data.getPosition,
          sharedProps,
          getPixelOffset,
          updateTriggers
        },
        opts
      )
    ];
  }
}

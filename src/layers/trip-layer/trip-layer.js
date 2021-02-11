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

import memoize from 'lodash.memoize';
import uniq from 'lodash.uniq';
import Layer from '../base-layer';
import {TripsLayer as DeckGLTripsLayer} from '@deck.gl/geo-layers';

import {GEOJSON_FIELDS} from 'constants/default-settings';
import TripLayerIcon from './trip-layer-icon';

import {
  getGeojsonDataMaps,
  getGeojsonBounds,
  getGeojsonFeatureTypes
} from 'layers/geojson-layer/geojson-utils';

import {isTripGeoJsonField, parseTripGeoJsonTimestamp} from './trip-utils';
import TripInfoModalFactory from './trip-info-modal';

const zoomFactorValue = 8;

export const defaultThickness = 0.5;
export const defaultLineWidth = 1;

export const tripVisConfigs = {
  opacity: 'opacity',
  thickness: {
    type: 'number',
    defaultValue: defaultThickness,
    label: 'Stroke Width',
    isRanged: false,
    range: [0, 100],
    step: 0.1,
    group: 'stroke',
    property: 'thickness'
  },
  colorRange: 'colorRange',
  trailLength: 'trailLength',
  sizeRange: 'strokeWidthRange'
};

export const geoJsonRequiredColumns = ['geojson'];
export const featureAccessor = ({geojson}) => d => d.valueAt(geojson.fieldIdx);
export const featureResolver = ({geojson}) => geojson.fieldIdx;

export default class TripLayer extends Layer {
  constructor(props) {
    super(props);

    this.dataToFeature = [];
    this.dataToTimeStamp = [];
    this.registerVisConfig(tripVisConfigs);
    this.getFeature = memoize(featureAccessor, featureResolver);
    this._layerInfoModal = TripInfoModalFactory();
  }

  get type() {
    return 'trip';
  }

  get name() {
    return 'Trip';
  }

  get layerIcon() {
    return TripLayerIcon;
  }

  get requiredLayerColumns() {
    return geoJsonRequiredColumns;
  }

  get visualChannels() {
    const visualChannels = super.visualChannels;

    return {
      ...visualChannels,
      color: {
        ...visualChannels.color,
        accessor: 'getColor',
        nullValue: visualChannels.color.nullValue,
        getAttributeValue: config => d => d.properties.lineColor || config.color,
        // used this to get updateTriggers
        defaultValue: config => config.color
      },
      size: {
        ...visualChannels.size,
        property: 'stroke',
        accessor: 'getWidth',
        condition: config => config.visConfig.stroked,
        nullValue: 0,
        getAttributeValue: () => d => d.properties.lineWidth || defaultLineWidth
      }
    };
  }

  get animationDomain() {
    return this.config.animation.domain;
  }

  get layerInfoModal() {
    return {
      id: 'iconInfo',
      template: this._layerInfoModal,
      modalProps: {
        title: 'modal.tripInfo.title'
      }
    };
  }

  getPositionAccessor() {
    return this.getFeature(this.config.columns);
  }

  static findDefaultLayerProps({label, fields = [], dataContainer, id}, foundLayers) {
    const geojsonColumns = fields.filter(f => f.type === 'geojson').map(f => f.name);

    const defaultColumns = {
      geojson: uniq([...GEOJSON_FIELDS.geojson, ...geojsonColumns])
    };

    const geoJsonColumns = this.findDefaultColumnField(defaultColumns, fields);

    const tripColumns = (geoJsonColumns || []).filter(col =>
      isTripGeoJsonField(dataContainer, fields[col.geojson.fieldIdx])
    );

    if (!tripColumns.length) {
      return {props: []};
    }

    return {
      props: tripColumns.map(columns => ({
        label: (typeof label === 'string' && label.replace(/\.[^/.]+$/, '')) || this.type,
        columns,
        isVisible: true
      })),

      // if a geojson layer is created from this column, delete it
      foundLayers: foundLayers.filter(
        prop =>
          prop.type !== 'geojson' ||
          prop.dataId !== id ||
          !tripColumns.find(c => prop.columns.geojson.name === c.geojson.name)
      )
    };
  }

  getDefaultLayerConfig(props) {
    return {
      ...super.getDefaultLayerConfig(props),
      animation: {
        enabled: true,
        domain: null
      }
    };
  }

  getHoverData(object, dataContainer) {
    // index for dataContainer is saved to feature.properties
    return dataContainer.row(object.properties.index);
  }

  calculateDataAttribute({dataContainer, filteredIndex}, getPosition) {
    return filteredIndex
      .map(i => this.dataToFeature[i])
      .filter(d => d && d.geometry.type === 'LineString');
  }

  formatLayerData(datasets, oldLayerData) {
    // to-do: parse segment from dataContainer
    const {dataContainer, gpuFilter} = datasets[this.config.dataId];
    const {data} = this.updateData(datasets, oldLayerData);

    const valueAccessor = f => dataContainer.row(f.properties.index);
    const indexAccessor = f => f.properties.index;
    const accessors = this.getAttributeAccessors(valueAccessor);

    return {
      data,
      getFilterValue: gpuFilter.filterValueAccessor(indexAccessor, valueAccessor),
      getPath: d => d.geometry.coordinates,
      getTimestamps: d => this.dataToTimeStamp[d.properties.index],
      ...accessors
    };
  }

  updateAnimationDomain(domain) {
    this.updateLayerConfig({
      animation: {
        ...this.config.animation,
        domain
      }
    });
  }

  updateLayerMeta(dataContainer) {
    const getFeature = this.getPositionAccessor();
    if (getFeature === this.meta.getFeature) {
      // TODO: revisit this after gpu filtering
      return;
    }

    this.dataToFeature = getGeojsonDataMaps(dataContainer, getFeature);

    const {dataToTimeStamp, animationDomain} = parseTripGeoJsonTimestamp(this.dataToFeature);

    this.dataToTimeStamp = dataToTimeStamp;
    this.updateAnimationDomain(animationDomain);

    // get bounds from features
    const bounds = getGeojsonBounds(this.dataToFeature);

    // keep a record of what type of geometry the collection has
    const featureTypes = getGeojsonFeatureTypes(this.dataToFeature);

    this.updateMeta({bounds, featureTypes, getFeature});
  }

  setInitialLayerConfig({dataContainer}) {
    this.updateLayerMeta(dataContainer);
    return this;
  }

  renderLayer(opts) {
    const {data, gpuFilter, mapState, animationConfig} = opts;
    const {visConfig} = this.config;
    const zoomFactor = this.getZoomFactor(mapState);
    const isValidTime =
      animationConfig &&
      Array.isArray(animationConfig.domain) &&
      animationConfig.domain.every(Number.isFinite) &&
      Number.isFinite(animationConfig.currentTime);

    if (!isValidTime) {
      return [];
    }

    const domain0 = animationConfig.domain?.[0];

    const updateTriggers = {
      ...this.getVisualChannelUpdateTriggers(),
      getTimestamps: {
        columns: this.config.columns,
        domain0
      },
      getFilterValue: gpuFilter.filterValueUpdateTriggers
    };
    const defaultLayerProps = this.getDefaultDeckLayerProps(opts);

    return [
      new DeckGLTripsLayer({
        ...defaultLayerProps,
        ...data,
        getTimestamps: d => data.getTimestamps(d).map(ts => ts - domain0),
        widthScale: this.config.visConfig.thickness * zoomFactor * zoomFactorValue,
        rounded: true,
        wrapLongitude: false,
        parameters: {
          depthTest: mapState.dragRotate,
          depthMask: false
        },
        trailLength: visConfig.trailLength * 1000,
        currentTime: animationConfig.currentTime - domain0,
        updateTriggers
      })
    ];
  }
}

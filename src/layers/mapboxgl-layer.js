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

import Layer, {OVERLAY_TYPE} from './base-layer';
import {createSelector} from 'reselect';

import {geoJsonFromData, prefixGpuField, gpuFilterToMapboxFilter} from './mapbox-utils';

export const mapboxRequiredColumns = ['lat', 'lng'];

export const pointColResolver = ({lat, lng}) => `${lat.fieldIdx}-${lng.fieldIdx}`;

class MapboxLayerGL extends Layer {
  get overlayType() {
    return OVERLAY_TYPE.mapboxgl;
  }

  get type() {
    return null;
  }

  get isAggregated() {
    return true;
  }

  get requiredLayerColumns() {
    return mapboxRequiredColumns;
  }

  get columnPairs() {
    return this.defaultPointColumnPairs;
  }

  get noneLayerDataAffectingProps() {
    return [];
  }

  get visualChannels() {
    return {};
  }
  datasetSelector = config => config.dataId;
  gpuFilterSelector = (config, datasets) => (datasets[config.dataId] || {}).gpuFilter;
  columnsSelector = config => pointColResolver(config.columns);

  sourceSelector = createSelector(
    this.datasetSelector,
    this.columnsSelector,
    (datasetId, columns) => `${datasetId}-${columns}`
  );

  filterSelector = createSelector(this.gpuFilterSelector, gpuFilter =>
    gpuFilterToMapboxFilter(gpuFilter)
  );

  isValidFilter(filter) {
    // mapbox will crash if filter is not an array or empty
    return Array.isArray(filter) && filter.length;
  }

  getDataUpdateTriggers({filteredIndex, gpuFilter, id}) {
    const {columns} = this.config;

    const visualChannelFields = Object.values(this.visualChannels).reduce(
      (accu, v) => ({
        ...accu,
        ...(this.config[v.field] ? {[v.field]: this.config[v.field].name} : {})
      }),
      {}
    );

    const updateTriggers = {
      getData: {
        datasetId: id,
        columns,
        filteredIndex,
        ...visualChannelFields,
        ...gpuFilter.filterValueUpdateTriggers
      },
      getMeta: {datasetId: id, columns}
    };

    return updateTriggers;
  }

  calculateDataAttribute({dataContainer, filteredIndex, gpuFilter}, getPosition) {
    const getGeometry = d => this.getGeometry(getPosition(d));

    const vcFields = Object.values(this.visualChannels)
      .map(v => this.config[v.field])
      .filter(v => v);

    const getPropertyFromVisualChanel = vcFields.length
      ? d =>
          vcFields.reduce(
            (accu, field) => ({
              ...accu,
              [field.name]: field.valueAccessor(d)
            }),
            {}
          )
      : d => ({});

    const {filterValueUpdateTriggers, filterValueAccessor} = gpuFilter;

    // gpuField To property
    const hasFilter = Object.values(filterValueUpdateTriggers).filter(d => d).length;
    const valueAccessor = filterValueAccessor();

    const getPropertyFromFilter = hasFilter
      ? (d, index) => {
          const filterValue = valueAccessor({data: d, index});
          return Object.values(filterValueUpdateTriggers).reduce(
            (accu, name, i) => ({
              ...accu,
              ...(name ? {[prefixGpuField(name)]: filterValue[i]} : {})
            }),
            {}
          );
        }
      : d => ({});

    const getProperties = (d, i) => ({
      ...getPropertyFromVisualChanel(d),
      ...getPropertyFromFilter(d, i)
    });

    return geoJsonFromData(dataContainer, filteredIndex, getGeometry, getProperties);
  }

  // this layer is rendered at mapbox level
  // todo: maybe need to find a better solution for this one
  shouldRenderLayer() {
    return this.type && this.config.isVisible && this.hasAllColumns();
  }
}

export default MapboxLayerGL;

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

import {Analyzer, DATA_TYPES} from 'type-analyzer';

import {getSampleData, timeToUnixMilli, notNullorUndefined} from 'utils/data-utils';

import {parseGeoJsonRawFeature, getGeojsonFeatureTypes} from 'layers/geojson-layer/geojson-utils';

/**
 * Parse geojson from string
 * @param {array} samples feature object values
 * @returns {boolean} whether the geometry coordinates has length of 4
 */
export function coordHasLength4(samples) {
  let hasLength4 = true;
  for (let i = 0; i < samples.length; i += 1) {
    hasLength4 = !samples[i].geometry.coordinates.find(c => c.length < 4);
    if (!hasLength4) {
      break;
    }
  }
  return hasLength4;
}

/**
 * Check whether geojson linestring's 4th coordinate is 1) not timestamp 2) unix time stamp 3) real date time
 * @param {array} timestamps array to be tested if its elements are timestamp
 * @returns {object | boolean} the type of timestamp: unix/datetime/invalid(not timestamp)
 */

export function containValidTime(timestamps) {
  const formattedTimeStamps = timestamps.map(ts => ({ts}));
  const ignoredDataTypes = Object.keys(DATA_TYPES).filter(
    type => ![DATA_TYPES.TIME, DATA_TYPES.DATETIME].includes(type)
  );

  // ignore all types but TIME to improve performance
  const analyzedType = Analyzer.computeColMeta(formattedTimeStamps, [], {ignoredDataTypes})[0];

  if (!analyzedType || analyzedType.category !== 'TIME') {
    return false;
  }
  return analyzedType;
}

/**
 * Check if geojson features are trip layer animatable by meeting 3 conditions
 * @param {import('utils/table-utils/data-container-interface').DataContainerInterface} dataContainer geojson feature objects container
 * @param {object} field array of geojson feature objects
 * @returns {boolean} whether it is trip layer animatable
 */
export function isTripGeoJsonField(dataContainer, field) {
  const getValue = d => field.valueAccessor(d);
  const maxCount = 10000;
  const sampleRawFeatures =
    dataContainer.numRows() > maxCount
      ? getSampleData(dataContainer, maxCount, getValue)
      : dataContainer.map(getValue);

  const features = sampleRawFeatures.map(parseGeoJsonRawFeature).filter(f => f);
  const featureTypes = getGeojsonFeatureTypes(features);

  // condition 1: contain line string
  if (!featureTypes.line) {
    return false;
  }

  // condition 2:sample line strings contain 4 coordinates
  if (!coordHasLength4(features)) {
    return false;
  }

  // condition 3:the 4th coordinate of the first feature line strings is valid time
  const tsHolder = features[0].geometry.coordinates.map(coord => coord[3]);

  return Boolean(containValidTime(tsHolder));
}

/**
 * Get unix timestamp from animatable geojson for deck.gl trip layer
 * @param {Array<Object>} dataToFeature array of geojson feature objects, can be null
 * @returns {{dataToTimeStamp: Array[Number], animationDomain: null | Array<Number>}} {dataToTimeStamp: [], animationDomain: null}
 */
export function parseTripGeoJsonTimestamp(dataToFeature) {
  // Analyze type based on coordinates of the 1st lineString
  // select a sample trip to analyze time format
  const empty = {dataToTimeStamp: [], animationDomain: null};
  const sampleTrip = dataToFeature.find(
    f => f && f.geometry && f.geometry.coordinates && f.geometry.coordinates.length >= 3
  );

  // if no valid geometry
  if (!sampleTrip) {
    return empty;
  }

  const analyzedType = containValidTime(sampleTrip.geometry.coordinates.map(coord => coord[3]));

  if (!analyzedType) {
    return empty;
  }

  const {format} = analyzedType;
  const getTimeValue = coord =>
    coord && notNullorUndefined(coord[3]) ? timeToUnixMilli(coord[3], format) : null;

  const dataToTimeStamp = dataToFeature.map(f =>
    f && f.geometry && Array.isArray(f.geometry.coordinates)
      ? f.geometry.coordinates.map(getTimeValue)
      : null
  );

  const animationDomain = getAnimationDomainFromTimestamps(dataToTimeStamp);

  return {dataToTimeStamp, animationDomain};
}

function findMinFromSorted(list = []) {
  return list.find(d => notNullorUndefined(d) && Number.isFinite(d)) || null;
}

function findMaxFromSorted(list = []) {
  let i = list.length - 1;
  while (i > 0) {
    if (notNullorUndefined(list[i]) && Number.isFinite(list[i])) {
      return list[i];
    }
    i--;
  }
  return null;
}

export function getAnimationDomainFromTimestamps(dataToTimeStamp = []) {
  return dataToTimeStamp.reduce(
    (accu, tss) => {
      const tsMin = findMinFromSorted(tss);
      const tsMax = findMaxFromSorted(tss);
      if (Number.isFinite(tsMin) && Number.isFinite(tsMax)) {
        accu[0] = Math.min(accu[0], tsMin);
        accu[1] = Math.max(accu[1], tsMax);
      }
      return accu;
    },
    [Infinity, -Infinity]
  );
}

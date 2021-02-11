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

import {h3GetResolution, h3IsValid, h3ToGeo, h3ToGeoBoundary} from 'h3-js';
import {ALL_FIELD_TYPES} from 'constants/default-settings';
import {notNullorUndefined} from 'utils/data-utils';

export {h3GetResolution, h3IsValid};

// get vertices should return [lon, lat]
export function getVertices({id}) {
  // always reverse it
  return h3ToGeoBoundary(id, true);
}

// get centroid should return [lon, lat]
export function getCentroid({id}) {
  // always reverse it to [lng, lat]
  return h3ToGeo(id).reverse();
}

export function idToPolygonGeo(object, properties) {
  if (!object || !object.id) {
    return null;
  }

  const vertices = getVertices(object);

  return {
    geometry: {
      coordinates: vertices,
      type: 'LineString'
    },
    properties
  };
}

export const isHexField = (field, fieldIdx, dataContainer) => {
  if (field.type !== ALL_FIELD_TYPES.string) {
    return false;
  }

  const firstDP = dataContainer.find(d => notNullorUndefined(d.valueAt(fieldIdx)), true);
  return firstDP && h3IsValid(firstDP.valueAt(fieldIdx));
};

export const getHexFields = (fields, dataContainer) =>
  fields.filter((f, i) => isHexField(f, i, dataContainer));

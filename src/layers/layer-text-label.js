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

import {getDistanceScales} from 'viewport-mercator-project';
import {notNullorUndefined} from 'utils/data-utils';
import uniq from 'lodash.uniq';

export const defaultPadding = 20;

export function getTextOffsetByRadius(radiusScale, getRadius, mapState) {
  return textLabel => {
    const distanceScale = getDistanceScales(mapState);
    const xMult = textLabel.anchor === 'middle' ? 0 : textLabel.anchor === 'start' ? 1 : -1;
    const yMult = textLabel.alignment === 'center' ? 0 : textLabel.alignment === 'bottom' ? 1 : -1;

    const sizeOffset =
      textLabel.alignment === 'center'
        ? 0
        : textLabel.alignment === 'bottom'
        ? textLabel.size
        : textLabel.size;

    const pixelRadius = radiusScale * distanceScale.pixelsPerMeter[0];
    const padding = defaultPadding;

    return typeof getRadius === 'function'
      ? d => [
          xMult * (getRadius(d) * pixelRadius + padding),
          yMult * (getRadius(d) * pixelRadius + padding + sizeOffset)
        ]
      : [
          xMult * (getRadius * pixelRadius + padding),
          yMult * (getRadius * pixelRadius + padding + sizeOffset)
        ];
  };
}

export const textLabelAccessor = textLabel => d => {
  const val = textLabel.field.valueAccessor(d.refDataContainer.row(d.index));
  return notNullorUndefined(val) ? String(val) : '';
};

export const formatTextLabelData = ({textLabel, triggerChanged, oldLayerData, data}) => {
  return textLabel.map((tl, i) => {
    if (!tl.field) {
      // if no field selected,
      return {
        getText: null,
        characterSet: []
      };
    }

    const getText = textLabelAccessor(tl);
    let characterSet;

    if (
      !triggerChanged[`getLabelCharacterSet-${i}`] &&
      oldLayerData &&
      oldLayerData.textLabels &&
      oldLayerData.textLabels[i]
    ) {
      characterSet = oldLayerData.textLabels[i].characterSet;
    } else {
      const allLabels = tl.field ? data.map(getText) : [];
      characterSet = uniq(allLabels.join(''));
    }

    return {
      characterSet,
      getText
    };
  });
};

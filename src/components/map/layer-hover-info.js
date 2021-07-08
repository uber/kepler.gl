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

import React from 'react';
import styled from 'styled-components';
import {CenterFlexbox} from 'components/common/styled-components';
import {Layers} from 'components/common/icons';
import PropTypes from 'prop-types';
import {notNullorUndefined} from 'utils/data-utils';
import {getTooltipDisplayValue, getTooltipDisplayDeltaValue} from 'utils/interaction-utils';

export const StyledLayerName = styled(CenterFlexbox)`
  color: ${props => props.theme.textColorHl};
  font-size: 12px;
  letter-spacing: 0.43px;
  text-transform: capitalize;

  svg {
    margin-right: 4px;
  }
`;

const StyledTable = styled.table`
  & .row__delta-value {
    text-align: right;

    &.positive {
      color: ${props => props.theme.primaryBtnBgd};
    }

    &.negative {
      color: ${props => props.theme.negativeBtnActBgd};
    }
  }
`;

/** @type {import('./layer-hover-info').RowComponent} */
const Row = ({name, value, deltaValue, url}) => {
  // Set 'url' to 'value' if it looks like a url
  if (!url && value && typeof value === 'string' && value.match(/^http/)) {
    url = value;
  }

  const asImg = /<img>/.test(name);
  return (
    <tr className="row" key={name}>
      <td className="row__name">{name}</td>
      <td className="row__value">
        {asImg ? (
          <img src={value} />
        ) : url ? (
          <a target="_blank" rel="noopener noreferrer" href={url}>
            {value}
          </a>
        ) : (
          value
        )}
      </td>
      {notNullorUndefined(deltaValue) && (
        <td
          className={`row__delta-value ${
            deltaValue.toString().charAt(0) === '+' ? 'positive' : 'negative'
          }`}
        >
          {deltaValue}
        </td>
      )}
    </tr>
  );
};

const EntryInfo = ({fieldsToShow, fields, data, primaryData, compareType}) => (
  <tbody>
    {fieldsToShow.map(item => (
      <EntryInfoRow
        key={item.name}
        item={item}
        fields={fields}
        data={data}
        primaryData={primaryData}
        compareType={compareType}
      />
    ))}
  </tbody>
);

const EntryInfoRow = ({item, fields, data, primaryData, compareType}) => {
  const fieldIdx = fields.findIndex(f => f.name === item.name);
  if (fieldIdx < 0) {
    return null;
  }
  const field = fields[fieldIdx];
  const displayValue = getTooltipDisplayValue({item, field, data, fieldIdx});

  const displayDeltaValue = getTooltipDisplayDeltaValue({
    item,
    field,
    data,
    fieldIdx,
    primaryData,
    compareType
  });

  return <Row name={field.name} value={displayValue} deltaValue={displayDeltaValue} />;
};

// TODO: supporting comparative value for aggregated cells as well
const CellInfo = ({data, layer}) => {
  const {colorField, sizeField} = layer.config;

  return (
    <tbody>
      <Row name={'total points'} key="count" value={data.points && data.points.length} />
      {colorField && layer.visualChannels.color ? (
        <Row
          name={layer.getVisualChannelDescription('color').measure}
          key="color"
          value={data.colorValue || 'N/A'}
        />
      ) : null}
      {sizeField && layer.visualChannels.size ? (
        <Row
          name={layer.getVisualChannelDescription('size').measure}
          key="size"
          value={data.elevationValue || 'N/A'}
        />
      ) : null}
    </tbody>
  );
};

const LayerHoverInfoFactory = () => {
  const LayerHoverInfo = props => {
    const {data, layer} = props;

    if (!data || !layer) {
      return null;
    }

    return (
      <div className="map-popover__layer-info">
        <StyledLayerName className="map-popover__layer-name">
          <Layers height="12px" />
          {props.layer.config.label}
        </StyledLayerName>
        <StyledTable>
          {props.layer.isAggregated ? <CellInfo {...props} /> : <EntryInfo {...props} />}
        </StyledTable>
      </div>
    );
  };

  LayerHoverInfo.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.any),
    fieldsToShow: PropTypes.arrayOf(PropTypes.any),
    layer: PropTypes.object,
    data: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.object])
  };
  return LayerHoverInfo;
};

export default LayerHoverInfoFactory;

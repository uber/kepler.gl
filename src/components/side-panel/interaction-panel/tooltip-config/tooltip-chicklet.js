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

import React, {Component} from 'react';
import styled from 'styled-components';
import {ChickletButton, ChickletTag} from 'components/common/item-selector/chickleted-input';
import {Hash, Delete} from 'components/common/icons';
import DropdownList from 'components/common/item-selector/dropdown-list';
import {Tooltip} from 'components/common/styled-components';
import {FormattedMessage} from 'localization';
import onClickOutside from 'react-onclickoutside';
import {FIELD_OPTS} from 'constants/default-settings';
import {TOOLTIP_FORMATS, TOOLTIP_FORMAT_TYPES, TOOLTIP_KEY} from 'constants/tooltip';
import {getFormatter} from 'utils/data-utils';

const TIME_DISPLAY = '2020-05-11 14:00';
const getValue = fmt => fmt[TOOLTIP_KEY];

const addDTimeLabel = formats =>
  formats.map(f => ({
    ...f,
    label:
      f.type === TOOLTIP_FORMAT_TYPES.DATE_TIME || f.type === TOOLTIP_FORMAT_TYPES.DATE
        ? getFormatter(getValue(f))(TIME_DISPLAY)
        : f.label
  }));

function getFormatLabels(fields, fieldName) {
  const fieldType = fields.find(f => f.name === fieldName).type;
  const tooltipTypes = (fieldType && FIELD_OPTS[fieldType].format.tooltip) || [];
  const formatLabels = Object.values(TOOLTIP_FORMATS).filter(t => tooltipTypes.includes(t.type));

  return addDTimeLabel(formatLabels);
}

const ChickletAddonWrapper = styled.div`
  position: relative;
`;

const ChickletAddon = styled.div`
  margin-right: 4px;
`;

const StyledPopover = styled.div`
  margin-left: -64px;
  position: absolute;
  top: 20px;
  width: 140px;
  z-index: 101;
`;

const hashStyles = {
  SHOW: 'SHOW',
  ACTIVE: 'ACTIVE'
};

const IconDiv = styled.div.attrs({
  className: 'tooltip-chicklet__icon'
})`
  color: ${props =>
    props.status === hashStyles.SHOW
      ? props.theme.subtextColorActive
      : props.status === hashStyles.ACTIVE
      ? props.theme.activeColor
      : props.theme.textColor};
`;

function getFormatTooltip(formatLabels, format) {
  if (!format) {
    return null;
  }
  const formatLabel = formatLabels.find(fl => getValue(fl) === format);
  if (formatLabel) {
    return formatLabel.label;
  }
  return typeof format === 'object' ? JSON.stringify(format, null, 2) : String(format);
}

function TooltipChickletFactory(dataId, config, onChange, fields) {
  class TooltipChicklet extends Component {
    state = {
      show: false
    };

    componentDidMount() {
      document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentWillUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside, false);
    }

    handleClickOutside = e => {
      if (this.node.contains(e.target)) {
        return;
      }
      this.setState({show: false});
    };

    render() {
      const {disabled, item, displayOption, remove} = this.props;
      const {show} = this.state;
      const tooltipField = config.fieldsToShow[dataId].find(
        fieldToShow => fieldToShow.name === item.name
      );
      if (!tooltipField) {
        return null;
      }
      const formatLabels = getFormatLabels(fields, tooltipField.name);
      const hasFormat = Boolean(tooltipField.format);
      const selectionIndex = formatLabels.findIndex(fl => getValue(fl) === tooltipField.format);
      const hashStyle = show ? hashStyles.SHOW : hasFormat ? hashStyles.ACTIVE : null;

      return (
        <ChickletButton ref={node => (this.node = node)}>
          <ChickletTag>{displayOption(item)}</ChickletTag>
          {formatLabels.length > 1 && (
            <ChickletAddonWrapper>
              <ChickletAddon data-tip data-for={`addon-${tooltipField.name}`}>
                <IconDiv status={hashStyle}>
                  <Hash
                    height="8px"
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({show: Boolean(!show)});
                    }}
                  />
                </IconDiv>
                <Tooltip id={`addon-${tooltipField.name}`} effect="solid">
                  <span>
                    {hasFormat ? (
                      getFormatTooltip(formatLabels, tooltipField.format)
                    ) : (
                      <FormattedMessage id={'fieldSelector.formatting'} />
                    )}
                  </span>
                </Tooltip>
              </ChickletAddon>
              {show && (
                <StyledPopover>
                  <DropdownList
                    options={formatLabels}
                    selectionIndex={selectionIndex}
                    displayOption={({label}) => label}
                    onOptionSelected={(result, e) => {
                      e.stopPropagation();
                      this.setState({
                        show: false
                      });

                      const oldFieldsToShow = config.fieldsToShow[dataId];
                      const fieldsToShow = oldFieldsToShow.map(fieldToShow => {
                        return fieldToShow.name === tooltipField.name
                          ? {
                              name: tooltipField.name,
                              format: getValue(result)
                            }
                          : fieldToShow;
                      });
                      const newConfig = {
                        ...config,
                        fieldsToShow: {
                          ...config.fieldsToShow,
                          [dataId]: fieldsToShow
                        }
                      };
                      onChange(newConfig);
                    }}
                  />
                </StyledPopover>
              )}
            </ChickletAddonWrapper>
          )}
          <Delete onClick={disabled ? null : remove} />
        </ChickletButton>
      );
    }
  }
  return onClickOutside(TooltipChicklet);
}

export default TooltipChickletFactory;

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

import React, {Component, createRef} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled from 'styled-components';

import SliderHandle from './slider-handle';
import SliderBarHandle from './slider-bar-handle';
import {normalizeSliderValue} from 'utils/data-utils';
import {clamp} from 'utils/data-utils';

function noop() {}

const StyledRangeSlider = styled.div`
  position: relative;
  background-color: ${props => props.theme.sliderBarBgd};
  ${props => `${props.vertical ? 'width' : 'height'}: ${props.theme.sliderBarHeight}px`};
  ${props => `${props.vertical ? 'height' : 'width'}: 100%`};
`;

const SliderWrapper = styled.div`
  flex-grow: 1;
`;

export default class Slider extends Component {
  static propTypes = {
    title: PropTypes.string,
    isRanged: PropTypes.bool,
    value0: PropTypes.number,
    value1: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    sliderHandleWidth: PropTypes.number,
    onSlider0Change: PropTypes.func,
    onInput0Change: PropTypes.func,
    onSlider1Change: PropTypes.func,
    onInput1Change: PropTypes.func,
    onSliderBarChange: PropTypes.func,
    step: PropTypes.number,
    enableBarDrag: PropTypes.bool,
    showTooltip: PropTypes.bool
  };

  static defaultProps = {
    title: '',
    isRanged: true,
    value0: 0,
    value1: 100,
    minValue: 0,
    maxValue: 100,
    step: 1,
    sliderHandleWidth: 12,
    enableBarDrag: false,
    onSlider0Change: noop,
    onInput0Change: noop,
    onSlider1Change: noop,
    onInput1Change: noop,
    onSliderBarChange: noop,
    disabled: false,
    vertical: false,
    showTooltip: false
  };

  ref = createRef();
  track = createRef();

  _setAnchor = x => {
    // used to calculate delta
    this._anchor = x;
  };

  _getBaseDistance() {
    return this.props.vertical ? this.ref.current.offsetHeight : this.ref.current.offsetWidth;
  }

  _getDeltaVal(x) {
    const percent = x / this._getBaseDistance();
    const maxDelta = this.props.maxValue - this.props.minValue;
    return percent * maxDelta;
  }
  _getDeltaX(v) {
    const percent = v / (this.props.maxValue - this.props.minValue);
    const maxDelta = this._getBaseDistance();
    return percent * maxDelta;
  }

  _getValue(baseV, offset) {
    // offset is the distance between slider handle and track left
    const rawValue = baseV + this._getDeltaVal(offset);

    return this._normalizeValue(rawValue);
  }

  _normalizeValue(val) {
    const {minValue, step, marks} = this.props;
    return normalizeSliderValue(val, minValue, step, marks);
  }

  slide0Listener = x => {
    const {value1, minValue} = this.props;
    const val = this._getValue(minValue, x);
    this.props.onSlider0Change(clamp([minValue, value1], val));
  };

  slide1Listener = x => {
    const {minValue, maxValue, value0} = this.props;
    const val = this._getValue(minValue, x);
    this.props.onSlider1Change(clamp([value0, maxValue], val));
  };

  sliderBarListener = x => {
    const {value0, value1, minValue, maxValue} = this.props;
    // for slider bar, we use distance delta
    const anchor = this._anchor;
    const length = value1 - value0; // the length of the selected range shouldn't change when clamping
    const val0 = clamp([minValue, maxValue - length], this._getValue(value0, x - anchor));
    const val1 = clamp([val0 + length, maxValue], this._getValue(value1, x - anchor));

    const deltaX = this._getDeltaX(val0 - this.props.value0);
    this.props.onSliderBarChange(val0, val1);
    // update anchor
    this._anchor = this._anchor + deltaX;
  };

  calcHandleLeft0 = (w, l, num) => {
    return w === 0
      ? `calc(${l}% - ${this.props.sliderHandleWidth / 2}px)`
      : `calc(${l}% - ${this.props.sliderHandleWidth / 2}px)`;
  };

  calcHandleLeft1 = (w, l) => {
    return this.props.isRanged && w === 0
      ? `${l}%`
      : `calc(${l + w}% - ${this.props.sliderHandleWidth / 2}px)`;
  };

  render() {
    const {
      classSet,
      disabled,
      isRanged,
      maxValue,
      minValue,
      value1,
      vertical,
      sliderHandleWidth,
      showTooltip
    } = this.props;
    const value0 = !isRanged && minValue > 0 ? minValue : this.props.value0;
    const currValDelta = value1 - value0;
    const maxDelta = maxValue - minValue;
    const width = (currValDelta / maxDelta) * 100;

    const v0Left = ((value0 - minValue) / maxDelta) * 100;

    return (
      <SliderWrapper
        className={classnames('kg-slider', {...classSet, disabled})}
        ref={this.ref}
        isRanged={isRanged}
        vertical={vertical}
      >
        <StyledRangeSlider className="kg-range-slider" vertical={vertical} ref={this.track}>
          <SliderHandle
            className="kg-range-slider__handle"
            left={this.calcHandleLeft0(width, v0Left)}
            valueListener={this.slide0Listener}
            sliderHandleWidth={sliderHandleWidth}
            display={isRanged}
            vertical={vertical}
            showTooltip={showTooltip}
            track={this.track}
          />
          <SliderHandle
            className="kg-range-slider__handle"
            left={this.calcHandleLeft1(width, v0Left)}
            valueListener={this.slide1Listener}
            sliderHandleWidth={sliderHandleWidth}
            vertical={vertical}
            value={value1}
            showTooltip={showTooltip}
            track={this.track}
          />
          <SliderBarHandle
            width={width}
            v0Left={v0Left}
            enableBarDrag={this.props.enableBarDrag}
            sliderBarListener={this.sliderBarListener}
            vertical={vertical}
            track={this.track}
            setAnchor={this._setAnchor}
          />
        </StyledRangeSlider>
      </SliderWrapper>
    );
  }
}

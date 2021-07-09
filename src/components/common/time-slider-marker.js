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

import React, {useRef, useEffect, useMemo} from 'react';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import {scaleUtc} from 'd3-scale';
import {select} from 'd3-selection';
import {axisBottom} from 'd3-axis';
import styled from 'styled-components';
import {datetimeFormatter} from 'utils/data-utils';

const MIN_TICK_WIDTH_LARGE = 80;
const MIN_TICK_WIDTH_SMALL = 50;
const HEIGHT = 30;

const TimeSliderContainer = styled.svg`
  pointer-events: none;
  position: absolute;
  top: 0;
  overflow: visible;
  margin-top: 6px;

  .axis text {
    font-size: ${props => props.theme.axisFontSize};
    fill: ${props => props.theme.axisFontColor};
  }

  .axis line,
  .axis path {
    fill: none;
    stroke: ${props => props.theme.sliderBarBgd};
    shape-rendering: crispEdges;
    stroke-width: 2;
  }

  .axis .domain {
    display: none;
  }

  .value {
    fill: ${props => props.theme.axisFontColor};
    font-size: ${props => props.theme.axisFontSize};

    &.start {
      text-anchor: start;
    }

    &.end {
      text-anchor: end;
    }
  }
`;

const TICK_FORMATS = {
  millisecond: '.SSS',
  second: ':ss',
  minute: 'HH:ss',
  hour: 'HH A',
  day: 'ddd DD',
  week: 'MMM DD',
  month: 'MMM',
  year: 'YYYY'
};

// timezone sensitive tick formatter based on moment
// adapted based on d3 time scale tick format https://github.com/d3/d3-scale/blob/master/src/time.js#L59
export function getTickFormat(timezone) {
  // date is js date object
  const toMoment = timezone ? date => moment(date).tz(timezone) : moment;
  const formatter = datetimeFormatter(timezone);

  return date =>
    (toMoment(date).startOf('second') < date
      ? formatter(TICK_FORMATS.millisecond)
      : toMoment(date).startOf('minute') < date
      ? formatter(TICK_FORMATS.second)
      : toMoment(date).startOf('hour') < date
      ? formatter(TICK_FORMATS.minute)
      : toMoment(date).startOf('day') < date
      ? formatter(TICK_FORMATS.hour)
      : toMoment(date).startOf('month') < date
      ? toMoment(date).startOf('isoWeek') < date
        ? formatter(TICK_FORMATS.day)
        : formatter(TICK_FORMATS.week)
      : toMoment(date).startOf('year') < date
      ? formatter(TICK_FORMATS.month)
      : formatter(TICK_FORMATS.year))(date);
}

// create a helper function so we can test it
export function getXAxis(domain, width, isEnlarged, timezone) {
  if (!Array.isArray(domain) || !domain.every(Number.isFinite)) {
    return null;
  }
  const scale = scaleUtc()
    .domain(domain)
    .range([0, width]);
  if (!scale) {
    return null;
  }

  const ticks = Math.floor(width / (isEnlarged ? MIN_TICK_WIDTH_LARGE : MIN_TICK_WIDTH_SMALL));
  const tickFormat = timezone ? getTickFormat(timezone) : null;
  const xAxis = axisBottom(scale)
    .ticks(ticks)
    .tickSize(0)
    .tickPadding(12);
  if (tickFormat) {
    xAxis.tickFormat(tickFormat);
  }

  return xAxis;
}

export function updateAxis(xAxisRef, xAxis) {
  if (!xAxis) {
    return;
  }

  select(xAxisRef.current).call(xAxis);
}

function TimeSliderMarkerFactory() {
  const TimeSliderMarker = ({width, domain, isEnlarged = true, height = HEIGHT, timezone}) => {
    const xAxisRef = useRef(null);
    const xAxis = useMemo(() => getXAxis(domain, width, isEnlarged, timezone), [
      domain,
      width,
      isEnlarged,
      timezone
    ]);
    useEffect(() => {
      updateAxis(xAxisRef, xAxis);
    }, [xAxisRef, xAxis]);
    return (
      <TimeSliderContainer className="time-slider-marker" width={width} height={height}>
        <g className="x axis" ref={xAxisRef} transform="translate(0, 0)" />
      </TimeSliderContainer>
    );
  };

  TimeSliderMarker.propTypes = {
    domain: PropTypes.arrayOf(PropTypes.any).isRequired,
    width: PropTypes.number.isRequired
  };

  return React.memo(TimeSliderMarker);
}

export default TimeSliderMarkerFactory;

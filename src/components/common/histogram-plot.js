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

import React, {useMemo} from 'react';
import {scaleLinear} from 'd3-scale';
import {max} from 'd3-array';
import styled from 'styled-components';
import classnames from 'classnames';

const histogramStyle = {
  highlightW: 0.7,
  unHighlightedW: 0.4
};

const HistogramWrapper = styled.svg`
  overflow: visible;
  .histogram-bars {
    rect {
      fill: ${props => props.theme.histogramFillOutRange};
    }
    rect.in-range {
      fill: ${props => props.theme.histogramFillInRange};
    }
  }
`;

function HistogramPlotFactory() {
  const HistogramPlot = ({width, height, margin, isRanged, histogram, value, brushComponent}) => {
    const domain = useMemo(() => [histogram[0].x0, histogram[histogram.length - 1].x1], [
      histogram
    ]);
    const dataId = Object.keys(histogram[0]).filter(k => k !== 'x0' && k !== 'x1')[0];

    // use 1st for now
    const getValue = useMemo(() => d => d[dataId], [dataId]);

    const x = useMemo(
      () =>
        scaleLinear()
          .domain(domain)
          .range([0, width]),
      [domain, width]
    );

    const y = useMemo(
      () =>
        scaleLinear()
          .domain([0, Number(max(histogram, getValue))])
          .range([0, height]),
      [histogram, height, getValue]
    );

    const barWidth = width / histogram.length;

    return (
      <HistogramWrapper width={width} height={height} style={{marginTop: `${margin.top}px`}}>
        <g className="histogram-bars">
          {histogram.map(bar => {
            const inRange = bar.x1 <= value[1] && bar.x0 >= value[0];
            const wRatio = inRange ? histogramStyle.highlightW : histogramStyle.unHighlightedW;
            return (
              <rect
                className={classnames({'in-range': inRange})}
                key={bar.x0}
                height={y(getValue(bar))}
                width={barWidth * wRatio}
                x={x(bar.x0) + (barWidth * (1 - wRatio)) / 2}
                rx={1}
                ry={1}
                y={height - y(getValue(bar))}
              />
            );
          })}
        </g>
        <g transform={`translate(${isRanged ? 0 : barWidth / 2}, 0)`}>{brushComponent}</g>
      </HistogramWrapper>
    );
  };

  const EmpptyOrPlot = props =>
    !props.histogram || !props.histogram.length ? null : <HistogramPlot {...props} />;

  return EmpptyOrPlot;
}
export default HistogramPlotFactory;

// Copyright (c) 2020 Uber Technologies, Inc.
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

export const mockPolygonFeature = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [28.66601562502387, 15.343585399424173],
        [28.66601562502387, 11.109477534559822],
        [32.75292968752382, 11.109477534559822],
        [32.75292968752382, 15.343585399424173],
        [28.66601562502387, 15.343585399424173]
      ]
    ]
  },
  properties: {
    renderType: 'Polygon',
    isClosed: true,
    bbox: {
      xmin: 28.094726562479867,
      xmax: null,
      ymin: 10.872211827249156,
      ymax: null
    }
  },
  id: 'bf5be428-f522-4a52-8ea5-3e90e86aad51'
};

export const mockPolygonData = {
  fields: [
    {
      name: 'start_point_lat',
      type: 'real'
    },
    {
      name: 'start_point_lng',
      type: 'real'
    },
    {
      name: 'end_point_lat',
      type: 'real'
    },
    {
      name: 'end_point_lng',
      type: 'real'
    }
  ],
  data: [
    [12.25, 30.5, 45.5, 32.5],
    [12.25, 35.5, 45.5, 36.5],
    [14.25, 30.5, 47.5, 32.5],
    [14.25, 35.5, 47.5, 36.5]
  ],
  layers: [
    {
      id: 'm1buc6o',
      type: 'point',
      config: {
        dataId: 'puppy',
        label: 'start point',
        color: [227, 26, 26],
        columns: {
          lat: 'start_point_lat',
          lng: 'start_point_lng',
          altitude: null
        },
        isVisible: true,
        visConfig: {
          radius: 10,
          fixedRadius: false,
          opacity: 0.8,
          outline: false,
          thickness: 2,
          strokeColor: null,
          colorRange: {
            name: 'Global Warming',
            type: 'sequential',
            category: 'Uber',
            colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
          },
          strokeColorRange: {
            name: 'Global Warming',
            type: 'sequential',
            category: 'Uber',
            colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
          },
          radiusRange: [0, 50],
          filled: true
        },
        textLabel: [
          {
            field: null,
            color: [255, 255, 255],
            size: 18,
            offset: [0, 0],
            anchor: 'start',
            alignment: 'center'
          }
        ]
      },
      visualChannels: {
        colorField: null,
        colorScale: 'quantile',
        strokeColorField: null,
        strokeColorScale: 'quantile',
        sizeField: null,
        sizeScale: 'linear'
      }
    },
    {
      id: 'jcotm1p',
      type: 'point',
      config: {
        dataId: 'puppy',
        label: 'end point',
        color: [255, 203, 153],
        columns: {
          lat: 'end_point_lat',
          lng: 'end_point_lng',
          altitude: null
        },
        isVisible: true,
        visConfig: {
          radius: 10,
          fixedRadius: false,
          opacity: 0.8,
          outline: false,
          thickness: 2,
          strokeColor: null,
          colorRange: {
            name: 'Global Warming',
            type: 'sequential',
            category: 'Uber',
            colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
          },
          strokeColorRange: {
            name: 'Global Warming',
            type: 'sequential',
            category: 'Uber',
            colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
          },
          radiusRange: [0, 50],
          filled: true
        },
        textLabel: [
          {
            field: null,
            color: [255, 255, 255],
            size: 18,
            offset: [0, 0],
            anchor: 'start',
            alignment: 'center'
          }
        ]
      },
      visualChannels: {
        colorField: null,
        colorScale: 'quantile',
        strokeColorField: null,
        strokeColorScale: 'quantile',
        sizeField: null,
        sizeScale: 'linear'
      }
    }
  ],
  interactionConfig: {
    tooltip: {
      fieldsToShow: {
        zgi2h4mkn: []
      },
      enabled: true
    },
    brush: {
      size: 0.5,
      enabled: false
    }
  }
};

export const mockPolygonSecondData = [
  [11.25, 30.5, 45.5, 32.5],
  [11.25, 35.5, 45.5, 36.5],
  [18.25, 30.5, 47.5, 32.5],
  [18.25, 35.5, 47.5, 36.5]
];

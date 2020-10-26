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

const geojsonString = `{"type":"FeatureCollection","features":[{"geometry":{"type":"Point","coordinates":[-105.15471672508885,39.98626910199207,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"radius":1,"id":"a1398a11-d1ce-421c-bf66-a456ff525de9"}},{"geometry":{"type":"Point","coordinates":[-105.1549804351595,39.98397605319894,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"94ed2c0f-27ce-416e-b3b4-6c00954b41f0"}},{"geometry":{"type":"Point","coordinates":[-105.15478982047146,39.98296589543148,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"radius":3,"id":"1f59be4c-82e8-4644-b3cf-4c1c0510cbb2"}},{"geometry":{"type":"Point","coordinates":[-105.15449343321012,39.98437157892626,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"radius":5,"id":"de9210a0-c48c-41bf-8463-4b0734d402c0"}},{"geometry":{"type":"Point","coordinates":[-105.15484576666667,39.98312416666666,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"9438eea5-dde0-4e5e-bdf5-7420eedbc419"}},{"geometry":{"type":"Point","coordinates":[-105.15494596666667,39.98422703333333,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"radius":0.5,"id":"9ecefa7c-4fc6-46b7-936c-580a6084ff47"}},{"geometry":{"type":"Point","coordinates":[-105.15522212737501,39.98433057912913,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"696a33f6-3ff2-45a9-8a11-ab541aa2152f"}},{"geometry":{"type":"Point","coordinates":[-105.15447046666667,39.9834028,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"a5b27f57-37a4-4576-ac4e-24dfb57730c3"}},{"geometry":{"type":"Point","coordinates":[-105.15487273333333,39.98379046666667,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"7a640dbe-e0ca-4c50-a43a-b65ec33305b5"}},{"geometry":{"type":"Point","coordinates":[-105.154786,39.986418799999996,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"154cc349-c8b3-4b41-a008-364df1e6d83d"}},{"geometry":{"type":"Point","coordinates":[-105.15456956666667,39.984760566666665,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"932d45a2-bc4b-4825-9b9f-70b2415753b5"}},{"geometry":{"type":"Point","coordinates":[-105.15503543214001,39.983469561355626,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"a178d24c-1ea3-46cd-8762-3669d7b9d722"}},{"geometry":{"type":"Point","coordinates":[-105.15462816666667,39.984541766666666,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"41f8b94e-266c-450a-a7dc-60c159370ddb"}},{"geometry":{"type":"Point","coordinates":[-105.15494077274344,39.98493993797259,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"99ee26ca-13e1-4bef-bcd2-12cfc290d6ae"}},{"geometry":{"type":"Point","coordinates":[-105.15451193333332,39.98379226666666,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"de5103bb-2808-46b4-8012-76ceb5511fa9"}},{"geometry":{"type":"Point","coordinates":[-105.1547839,39.98589206666667,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"c5caef3d-abc9-4044-bb14-2f5999979d8d"}},{"geometry":{"type":"Point","coordinates":[-105.15513263333332,39.98269536666667,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"e0162a54-e2b2-4076-be24-4f550f0ac651"}},{"geometry":{"type":"Point","coordinates":[-105.1546226,39.98516726666667,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"e53ab272-7f6a-49b8-93f1-693bb57aa9f8"}},{"geometry":{"type":"Point","coordinates":[-105.1545185,39.98417893333333,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"fdc3fff3-5c35-430b-8bb4-9517473a8dc1"}},{"geometry":{"type":"Point","coordinates":[-105.15476356666666,39.98555806666667,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"f342e7bd-771d-4bf1-ad57-40d435f54fa0"}},{"geometry":{"type":"Point","coordinates":[-105.15468952992738,39.985742351897976,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"dbda33a4-b194-40e8-88a6-5e8816a97377"}},{"geometry":{"type":"Point","coordinates":[-105.1545091,39.983995666666665,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"5564b2fb-8368-4f81-a8b4-bebb30cbaaed"}},{"geometry":{"type":"Point","coordinates":[-105.15508416666667,39.985163,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"835f956f-6a86-4a7c-b1d6-3f32e4955a31"}},{"geometry":{"type":"Point","coordinates":[-105.15513636666667,39.983126066666664,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"8f8effff-f89d-417c-8e44-c8561f9f1eec"}},{"geometry":{"type":"Point","coordinates":[-105.15478573333333,39.98606776666667,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"59552665-bdd6-4c0c-bd0d-5ee79ea4848b"}},{"geometry":{"type":"Point","coordinates":[-105.1547872,39.9866052,0]},"type":"Feature","properties":{"fillColor":[77,193,156],"id":"32df5401-38d1-4e96-8d1e-a29d2c7c3955"}}]}`;
export default geojsonString;

export const featureString = `{"type":"Feature","geometry":{"type":"LineString","coordinates":[[41.8817441,-87.6335398],[41.88237441,-87.6331298]]},"properties":{"lat":41.8817441,"lng":-87.6335398,"icon":"place"}}`;

export const processedFeature = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [41.8817441, -87.6335398],
      [41.88237441, -87.6331298]
    ]
  },
  properties: {
    lat: 41.8817441,
    lng: -87.6335398,
    icon: 'place'
  }
};

export const processedFeatureFields = [
  {
    name: '_geojson',
    id: '_geojson',
    displayName: '_geojson',
    format: '',
    fieldIdx: 0,
    type: 'geojson',
    analyzerType: 'GEOMETRY',
    valueAccessor: values => values[0]
  },
  {
    name: 'lat',
    id: 'lat',
    displayName: 'lat',
    format: '',
    fieldIdx: 1,
    type: 'real',
    analyzerType: 'FLOAT',
    valueAccessor: values => values[1]
  },
  {
    name: 'lng',
    id: 'lng',
    displayName: 'lng',
    format: '',
    fieldIdx: 2,
    type: 'real',
    analyzerType: 'FLOAT',
    valueAccessor: values => values[2]
  },
  {
    name: 'icon',
    id: 'icon',
    displayName: 'icon',
    format: '',
    fieldIdx: 3,
    type: 'string',
    analyzerType: 'STRING',
    valueAccessor: values => values[3]
  }
];

export const processedFeatureRows = [
  [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [41.8817441, -87.6335398],
          [41.88237441, -87.6331298]
        ]
      },
      properties: {
        lat: 41.8817441,
        lng: -87.6335398,
        icon: 'place'
      }
    },
    41.8817441,
    -87.6335398,
    'place'
  ]
];

export const processedFields = [
  {
    name: '_geojson',
    id: '_geojson',
    displayName: '_geojson',
    format: '',
    fieldIdx: 0,
    type: 'geojson',
    analyzerType: 'GEOMETRY',
    valueAccessor: values => values[0]
  },
  {
    name: 'fillColor',
    id: 'fillColor',
    displayName: 'fillColor',
    format: '',
    fieldIdx: 1,
    type: 'geojson',
    analyzerType: 'ARRAY',
    valueAccessor: values => values[1]
  },
  {
    name: 'radius',
    id: 'radius',
    displayName: 'radius',
    format: '',
    fieldIdx: 2,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[2]
  },
  {
    name: 'id',
    id: 'id',
    displayName: 'id',
    format: '',
    fieldIdx: 3,
    type: 'string',
    analyzerType: 'STRING',
    valueAccessor: values => values[3]
  }
];

export const processedRows = [
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15471672508885, 39.98626910199207, 0]},
      type: 'Feature',
      properties: {fillColor: [77, 193, 156], radius: 1, id: 'a1398a11-d1ce-421c-bf66-a456ff525de9'}
    },
    [77, 193, 156],
    1,
    'a1398a11-d1ce-421c-bf66-a456ff525de9'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.1549804351595, 39.98397605319894, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '94ed2c0f-27ce-416e-b3b4-6c00954b41f0',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '94ed2c0f-27ce-416e-b3b4-6c00954b41f0'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15478982047146, 39.98296589543148, 0]},
      type: 'Feature',
      properties: {fillColor: [77, 193, 156], radius: 3, id: '1f59be4c-82e8-4644-b3cf-4c1c0510cbb2'}
    },
    [77, 193, 156],
    3,
    '1f59be4c-82e8-4644-b3cf-4c1c0510cbb2'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15449343321012, 39.98437157892626, 0]},
      type: 'Feature',
      properties: {fillColor: [77, 193, 156], radius: 5, id: 'de9210a0-c48c-41bf-8463-4b0734d402c0'}
    },
    [77, 193, 156],
    5,
    'de9210a0-c48c-41bf-8463-4b0734d402c0'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15484576666667, 39.98312416666666, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '9438eea5-dde0-4e5e-bdf5-7420eedbc419',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '9438eea5-dde0-4e5e-bdf5-7420eedbc419'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15494596666667, 39.98422703333333, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        radius: 0.5,
        id: '9ecefa7c-4fc6-46b7-936c-580a6084ff47'
      }
    },
    [77, 193, 156],
    0.5,
    '9ecefa7c-4fc6-46b7-936c-580a6084ff47'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15522212737501, 39.98433057912913, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '696a33f6-3ff2-45a9-8a11-ab541aa2152f',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '696a33f6-3ff2-45a9-8a11-ab541aa2152f'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15447046666667, 39.9834028, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'a5b27f57-37a4-4576-ac4e-24dfb57730c3',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'a5b27f57-37a4-4576-ac4e-24dfb57730c3'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15487273333333, 39.98379046666667, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '7a640dbe-e0ca-4c50-a43a-b65ec33305b5',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '7a640dbe-e0ca-4c50-a43a-b65ec33305b5'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.154786, 39.986418799999996, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '154cc349-c8b3-4b41-a008-364df1e6d83d',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '154cc349-c8b3-4b41-a008-364df1e6d83d'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15456956666667, 39.984760566666665, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '932d45a2-bc4b-4825-9b9f-70b2415753b5',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '932d45a2-bc4b-4825-9b9f-70b2415753b5'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15503543214001, 39.983469561355626, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'a178d24c-1ea3-46cd-8762-3669d7b9d722',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'a178d24c-1ea3-46cd-8762-3669d7b9d722'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15462816666667, 39.984541766666666, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '41f8b94e-266c-450a-a7dc-60c159370ddb',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '41f8b94e-266c-450a-a7dc-60c159370ddb'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15494077274344, 39.98493993797259, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '99ee26ca-13e1-4bef-bcd2-12cfc290d6ae',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '99ee26ca-13e1-4bef-bcd2-12cfc290d6ae'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15451193333332, 39.98379226666666, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'de5103bb-2808-46b4-8012-76ceb5511fa9',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'de5103bb-2808-46b4-8012-76ceb5511fa9'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.1547839, 39.98589206666667, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'c5caef3d-abc9-4044-bb14-2f5999979d8d',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'c5caef3d-abc9-4044-bb14-2f5999979d8d'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15513263333332, 39.98269536666667, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'e0162a54-e2b2-4076-be24-4f550f0ac651',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'e0162a54-e2b2-4076-be24-4f550f0ac651'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.1546226, 39.98516726666667, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'e53ab272-7f6a-49b8-93f1-693bb57aa9f8',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'e53ab272-7f6a-49b8-93f1-693bb57aa9f8'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.1545185, 39.98417893333333, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'fdc3fff3-5c35-430b-8bb4-9517473a8dc1',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'fdc3fff3-5c35-430b-8bb4-9517473a8dc1'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15476356666666, 39.98555806666667, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'f342e7bd-771d-4bf1-ad57-40d435f54fa0',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'f342e7bd-771d-4bf1-ad57-40d435f54fa0'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15468952992738, 39.985742351897976, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: 'dbda33a4-b194-40e8-88a6-5e8816a97377',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    'dbda33a4-b194-40e8-88a6-5e8816a97377'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.1545091, 39.983995666666665, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '5564b2fb-8368-4f81-a8b4-bebb30cbaaed',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '5564b2fb-8368-4f81-a8b4-bebb30cbaaed'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15508416666667, 39.985163, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '835f956f-6a86-4a7c-b1d6-3f32e4955a31',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '835f956f-6a86-4a7c-b1d6-3f32e4955a31'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15513636666667, 39.983126066666664, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '8f8effff-f89d-417c-8e44-c8561f9f1eec',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '8f8effff-f89d-417c-8e44-c8561f9f1eec'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.15478573333333, 39.98606776666667, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '59552665-bdd6-4c0c-bd0d-5ee79ea4848b',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '59552665-bdd6-4c0c-bd0d-5ee79ea4848b'
  ],
  [
    {
      geometry: {type: 'Point', coordinates: [-105.1547872, 39.9866052, 0]},
      type: 'Feature',
      properties: {
        fillColor: [77, 193, 156],
        id: '32df5401-38d1-4e96-8d1e-a29d2c7c3955',
        radius: null
      }
    },
    [77, 193, 156],
    null,
    '32df5401-38d1-4e96-8d1e-a29d2c7c3955'
  ]
];

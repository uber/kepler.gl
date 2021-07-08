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

const data = `[{"bedrooms": "Null", "bathrooms": "N/A", "effectiveyearbuilt": "Null", "roll_landbaseyear": "N/", "roll_totlandimp": "37827477", "nettaxablevalue": "37827477", "center_lon": "-118.40032195", "roll_landvalue": "10627524", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "27199953", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "37827477", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "37085763", "nettaxablevalue": "37097927", "center_lon": "-118.40032195", "roll_landvalue": "10419142", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "26666621", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "37097927", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "35463324", "nettaxablevalue": "35463324", "center_lon": "-118.40032195", "roll_landvalue": "9963324", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "25500000", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "35463324", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "36172590", "nettaxablevalue": "36172590", "center_lon": "-118.40032195", "roll_landvalue": "10162590", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "26010000", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "36172590", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "38758435", "nettaxablevalue": "38775032", "center_lon": "-118.40032195", "roll_landvalue": "10889073", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "27869362", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "38775032", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "36086860", "nettaxablevalue": "36092822", "center_lon": "-118.40032195", "roll_landvalue": "10138504", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "25948356", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "36092822", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "37999212", "nettaxablevalue": "38012236", "center_lon": "-118.40032195", "roll_landvalue": "10675772", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "27323440", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "38012236", "situszip5": "90034", "center_lat": "34.02322471"}, {"bedrooms": "99", "bathrooms": "99", "effectiveyearbuilt": "2006", "roll_landbaseyear": "2007", "roll_totlandimp": "36358593", "nettaxablevalue": "36370757", "center_lon": "-118.40032195", "roll_landvalue": "10214846", "usecodedescchar1": "Residential", "usetype": "R-I", "yearbuiltTS": "1136073600000", "yearbuilt": "2006", "roll_impvalue": "26143747", "istaxableparcel": "true", "propertylocation": "3762 CLARINGTON AVE  LOS ANGELES CA  90034", "units": "116", "sqftmain": "130693", "roll_totalvalue": "36370757", "situszip5": "90034", "center_lat": "34.02322471"}]`;

export const parsedFields = [
  {
    name: 'bedrooms',
    id: 'bedrooms',
    displayName: 'bedrooms',
    format: '',
    fieldIdx: 0,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[0]
  },
  {
    name: 'bathrooms',
    id: 'bathrooms',
    displayName: 'bathrooms',
    format: '',
    fieldIdx: 1,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[1]
  },
  {
    name: 'effectiveyearbuilt',
    id: 'effectiveyearbuilt',
    displayName: 'effectiveyearbuilt',
    format: '',
    fieldIdx: 2,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[2]
  },
  {
    name: 'roll_landbaseyear',
    id: 'roll_landbaseyear',
    displayName: 'roll_landbaseyear',
    format: '',
    fieldIdx: 3,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[3]
  },
  {
    name: 'roll_totlandimp',
    id: 'roll_totlandimp',
    displayName: 'roll_totlandimp',
    format: '',
    fieldIdx: 4,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[4]
  },
  {
    name: 'nettaxablevalue',
    id: 'nettaxablevalue',
    displayName: 'nettaxablevalue',
    format: '',
    fieldIdx: 5,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[5]
  },
  {
    name: 'center_lon',
    id: 'center_lon',
    displayName: 'center_lon',
    format: '',
    fieldIdx: 6,
    type: 'real',
    analyzerType: 'FLOAT',
    valueAccessor: values => values[6]
  },
  {
    name: 'roll_landvalue',
    id: 'roll_landvalue',
    displayName: 'roll_landvalue',
    format: '',
    fieldIdx: 7,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[7]
  },
  {
    name: 'usecodedescchar1',
    id: 'usecodedescchar1',
    displayName: 'usecodedescchar1',
    format: '',
    fieldIdx: 8,
    type: 'string',
    analyzerType: 'STRING',
    valueAccessor: values => values[8]
  },
  {
    name: 'usetype',
    id: 'usetype',
    displayName: 'usetype',
    format: '',
    fieldIdx: 9,
    type: 'string',
    analyzerType: 'STRING',
    valueAccessor: values => values[9]
  },
  {
    name: 'yearbuiltTS',
    id: 'yearbuiltTS',
    displayName: 'yearbuiltTS',
    format: 'X',
    fieldIdx: 10,
    type: 'timestamp',
    analyzerType: 'TIME',
    valueAccessor: values => values[10]
  },
  {
    name: 'yearbuilt',
    id: 'yearbuilt',
    displayName: 'yearbuilt',
    format: '',
    fieldIdx: 11,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[11]
  },
  {
    name: 'roll_impvalue',
    id: 'roll_impvalue',
    displayName: 'roll_impvalue',
    format: '',
    fieldIdx: 12,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[12]
  },
  {
    name: 'istaxableparcel',
    id: 'istaxableparcel',
    displayName: 'istaxableparcel',
    format: '',
    fieldIdx: 13,
    type: 'boolean',
    analyzerType: 'BOOLEAN',
    valueAccessor: values => values[13]
  },
  {
    name: 'propertylocation',
    id: 'propertylocation',
    displayName: 'propertylocation',
    format: '',
    fieldIdx: 14,
    type: 'string',
    analyzerType: 'STRING',
    valueAccessor: values => values[14]
  },
  {
    name: 'units',
    id: 'units',
    displayName: 'units',
    format: '',
    fieldIdx: 15,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[15]
  },
  {
    name: 'sqftmain',
    id: 'sqftmain',
    displayName: 'sqftmain',
    format: '',
    fieldIdx: 16,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[16]
  },
  {
    name: 'roll_totalvalue',
    id: 'roll_totalvalue',
    displayName: 'roll_totalvalue',
    format: '',
    fieldIdx: 17,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[17]
  },
  {
    name: 'situszip5',
    id: 'situszip5',
    displayName: 'situszip5',
    format: '',
    fieldIdx: 18,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[18]
  },
  {
    name: 'center_lat',
    id: 'center_lat',
    displayName: 'center_lat',
    format: '',
    fieldIdx: 19,
    type: 'real',
    analyzerType: 'FLOAT',
    valueAccessor: values => values[19]
  }
];

export const parsedRows = [
  [
    null,
    NaN,
    null,
    NaN,
    37827477,
    37827477,
    -118.40032195,
    10627524,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    27199953,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    37827477,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    37085763,
    37097927,
    -118.40032195,
    10419142,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    26666621,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    37097927,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    35463324,
    35463324,
    -118.40032195,
    9963324,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    25500000,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    35463324,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    36172590,
    36172590,
    -118.40032195,
    10162590,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    26010000,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    36172590,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    38758435,
    38775032,
    -118.40032195,
    10889073,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    27869362,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    38775032,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    36086860,
    36092822,
    -118.40032195,
    10138504,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    25948356,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    36092822,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    37999212,
    38012236,
    -118.40032195,
    10675772,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    27323440,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    38012236,
    90034,
    34.02322471
  ],
  [
    99,
    99,
    2006,
    2007,
    36358593,
    36370757,
    -118.40032195,
    10214846,
    'Residential',
    'R-I',
    1136073600000,
    2006,
    26143747,
    true,
    '3762 CLARINGTON AVE  LOS ANGELES CA  90034',
    116,
    130693,
    36370757,
    90034,
    34.02322471
  ]
];

export default data;

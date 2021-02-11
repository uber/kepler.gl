Replace kepler.gl dataset with table class

## Current Dataset structure

```js
export type KeplerDataset = {
  id: string,
  label?: string,
  color: RGBColor,

  // fields and data
  fields: KeplerField[],
  dataContainer: DataContainer,

  allIndexes: number[],
  filteredIndex: number[],
  filteredIdxCPU: number[],
  filteredIndexForDomain: number[],
  fieldPairs: {
    defaultName: string,
    pair: any,
    suffix: string[]
  }[],
  gpuFilter: {
    filterRange: number[][],
    filterValueUpdateTriggers: any,
    filterValueAccessor: any
  },
  filterRecord: FilterRecord,
  filterRecordCPU: FilterRecord,
  changedFilters: any,

  // table-injected metadata
  sortColumn?: {
    // column name: sorted idx
    [key: string]: number[]
  },
  sortOrder?: string, // ASCENDING | DESCENDING | UNSORT

  pinnedColumns?: string[],
  // table-injected metadata
  metadata?: object
};

export type KeplerField = {
  analyzerType: string,
  id: string,
  name: string,
  format: string,
  fieldIdx: number,
  type: string,

  // meta data, storing domain and mappedValues
  filterProps?: any
};
```

### Table class should handle:

#### Add and remove columns (partially supported)

Missing features

- Copy over column meta, if replacing an existing column
- Recompute fieldPairs

#### Current kepler.gl methods:

1. `initalize`

to replace utils/dataset-utils `createNewDataEntry` This table method takes a `ProtoTable` and return a `Table` to be saved in kepler state.

```js
table.initalize(protoTable);

// following meta data should be initialized
table.allIndexes,
  table.filteredIndex,
  table.filteredIndexForDomain,
  table.fieldPairs,
  table.gpuFilter;
```

2. `getValue(columnName, rowIdx)`
   Get the value of a cell
   Should be a curried function
   getValue(columName) = idx => value

3. `getColumnDomain(columnName)`
   to replace `filter-utils.js` `getFieldDomain`
   Get the value domain of a specific column used in filter

4. `getColumnScaleDomain(columnName, scaleType)`
   to replace `base-layer.js` `layer.calculateLayerDomain`
   Get the domain of this column based on scale type

5. `getSampleData(rows)`
   Get a sample of rows to calculate layer boundaries

6. `parseFieldValue(value, type) => string`
   Parse cell value based on column type and return a string representation
   Value the field value, type the field type

7. `sortDatasetByColumn`
   Sort a column, return an sorted index, assign to `sortColumn`, `sortOrder`

8. `filterDataset(filters, layers, opt)`
   to replace `filter-utils.js` `filterDataset`
   Apply filters to dataset, return the filtered dataset with updated `gpuFilter`, `filterRecord`, `filteredIndex`, `filteredIndexForDomain`

9. `filterDatasetCPU(filters)`
   to replace `filter-utils.js` `filterDatasetCPU`
   Apply filters to a dataset all on CPU, assign to `filteredIdxCPU`, `filterRecordCPU`

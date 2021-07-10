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

import window from 'global/window';
import {BrushingExtension} from '@deck.gl/extensions';

import SvgIconLayer from 'deckgl-layers/svg-icon-layer/svg-icon-layer';
import IconLayerIcon from './icon-layer-icon';
import {ICON_FIELDS, CLOUDFRONT} from 'constants/default-settings';
import IconInfoModalFactory from './icon-info-modal';
import Layer from '../base-layer';
import {getTextOffsetByRadius, formatTextLabelData} from '../layer-text-label';

const brushingExtension = new BrushingExtension();

export const SVG_ICON_URL = `${CLOUDFRONT}/icons/svg-icons.json`;

export const iconPosAccessor = ({lat, lng, altitude}) => d => [
  d.data[lng.fieldIdx],
  d.data[lat.fieldIdx],
  altitude?.fieldIdx > -1 ? d.data[altitude.fieldIdx] : 0
];
export const iconAccessor = ({icon}) => d => d.data[icon.fieldIdx];

export const iconRequiredColumns = ['lat', 'lng', 'icon'];
export const iconOptionalColumns = ['altitude'];

export const pointVisConfigs = {
  radius: 'radius',
  fixedRadius: 'fixedRadius',
  opacity: 'opacity',
  colorRange: 'colorRange',
  radiusRange: 'radiusRange'
};

function flatterIconPositions(icon) {
  // had to flip y, since @luma modal has changed
  return icon.mesh.cells.reduce((prev, cell) => {
    cell.forEach(p => {
      prev.push(
        ...[icon.mesh.positions[p][0], -icon.mesh.positions[p][1], icon.mesh.positions[p][2]]
      );
    });
    return prev;
  }, []);
}

export default class IconLayer extends Layer {
  constructor(props = {}) {
    super(props);

    this.registerVisConfig(pointVisConfigs);
    this.getPositionAccessor = () => iconPosAccessor(this.config.columns);
    this.getIconAccessor = () => iconAccessor(this.config.columns);

    // prepare layer info modal
    this._layerInfoModal = IconInfoModalFactory();
    this.iconGeometry = props.iconGeometry || null;
    this.getSvgIcons();
  }

  get type() {
    return 'icon';
  }

  get requiredLayerColumns() {
    return iconRequiredColumns;
  }

  get optionalColumns() {
    return iconOptionalColumns;
  }

  get columnPairs() {
    return this.defaultPointColumnPairs;
  }

  get layerIcon() {
    return IconLayerIcon;
  }

  get visualChannels() {
    return {
      color: {
        ...super.visualChannels.color,
        accessor: 'getFillColor',
        defaultValue: config => config.color
      },
      size: {
        ...super.visualChannels.size,
        property: 'radius',
        range: 'radiusRange',
        channelScaleType: 'radius',
        accessor: 'getRadius',
        defaultValue: 1
      }
    };
  }

  get layerInfoModal() {
    return {
      id: 'iconInfo',
      template: this._layerInfoModal,
      modalProps: {
        title: 'modal.iconInfo.title'
      }
    };
  }

  getSvgIcons() {
    const fetchConfig = {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    };

    if (window.fetch) {
      window
        .fetch(SVG_ICON_URL, fetchConfig)
        .then(response => response.json())
        .then((parsed = {}) => {
          const {svgIcons = []} = parsed;
          this.iconGeometry = svgIcons.reduce(
            (accu, curr) => ({
              ...accu,
              [curr.id]: flatterIconPositions(curr)
            }),
            {}
          );

          this._layerInfoModal = IconInfoModalFactory(svgIcons);
        });
    }
  }

  static findDefaultLayerProps({fieldPairs = [], fields = []}) {
    const notFound = {props: []};
    if (!fieldPairs.length || !fields.length) {
      return notFound;
    }

    const iconFields = fields.filter(({name}) =>
      name
        .replace(/[_,.]+/g, ' ')
        .trim()
        .split(' ')
        .some(seg => ICON_FIELDS.icon.some(t => t.includes(seg)))
    );

    if (!iconFields.length) {
      return notFound;
    }

    // create icon layers for first point pair
    const ptPair = fieldPairs[0];

    const props = iconFields.map(iconField => ({
      label: iconField.name.replace(/[_,.]+/g, ' ').trim(),
      columns: {
        lat: ptPair.pair.lat,
        lng: ptPair.pair.lng,
        icon: {
          value: iconField.name,
          fieldIdx: iconField.fieldIdx
        }
      },
      isVisible: true
    }));

    return {props};
  }

  calculateDataAttribute({allData, filteredIndex}, getPosition) {
    const getIcon = this.getIconAccessor();
    const data = [];

    for (let i = 0; i < filteredIndex.length; i++) {
      const index = filteredIndex[i];
      const pos = getPosition({data: allData[index]});
      const icon = getIcon({data: allData[index]});

      // if doesn't have point lat or lng, do not add the point
      // deck.gl can't handle position = null
      if (pos.every(Number.isFinite) && typeof icon === 'string') {
        data.push({
          index,
          icon,
          data: allData[index]
        });
      }
    }

    return data;
  }

  formatLayerData(datasets, oldLayerData) {
    const {textLabel} = this.config;
    const getPosition = this.getPositionAccessor();

    const {gpuFilter} = datasets[this.config.dataId];
    const {data, triggerChanged} = this.updateData(datasets, oldLayerData);

    // get all distinct characters in the text labels
    const textLabels = formatTextLabelData({
      textLabel,
      triggerChanged,
      oldLayerData,
      data
    });

    const accessors = this.getAttributeAccessors();

    return {
      data,
      getPosition,
      getFilterValue: gpuFilter.filterValueAccessor(),
      textLabels,
      ...accessors
    };
  }

  updateLayerMeta(allData, getPosition) {
    const bounds = this.getPointsBounds(allData, d => getPosition({data: d}));
    this.updateMeta({bounds});
  }

  renderLayer(opts) {
    const {data, gpuFilter, objectHovered, mapState, interactionConfig} = opts;

    const radiusScale = this.getRadiusScaleByZoom(mapState);

    const layerProps = {
      radiusScale,
      ...(this.config.visConfig.fixedRadius ? {} : {radiusMaxPixels: 15})
    };

    const updateTriggers = {
      getPosition: this.config.columns,
      getFilterValue: gpuFilter.filterValueUpdateTriggers,
      ...this.getVisualChannelUpdateTriggers()
    };

    const defaultLayerProps = this.getDefaultDeckLayerProps(opts);
    const brushingProps = this.getBrushingExtensionProps(interactionConfig);
    const getPixelOffset = getTextOffsetByRadius(radiusScale, data.getRadius, mapState);
    const extensions = [...defaultLayerProps.extensions, brushingExtension];

    // shared Props between layer and label layer
    const sharedProps = {
      getFilterValue: data.getFilterValue,
      extensions,
      filterRange: defaultLayerProps.filterRange,
      ...brushingProps
    };

    const labelLayers = [
      ...this.renderTextLabelLayer(
        {
          getPosition: data.getPosition,
          sharedProps,
          getPixelOffset,
          updateTriggers
        },
        opts
      )
    ];
    const hoveredObject = this.hasHoveredObject(objectHovered);

    const parameters = {
      // icons will be flat on the map when the altitude column is not used
      depthTest: this.config.columns.altitude?.fieldIdx > -1
    };

    return !this.iconGeometry
      ? []
      : [
          new SvgIconLayer({
            ...defaultLayerProps,
            ...brushingProps,
            ...layerProps,
            ...data,
            parameters,
            getIconGeometry: id => this.iconGeometry[id],

            // update triggers
            updateTriggers,
            extensions
          }),

          ...(hoveredObject
            ? [
                new SvgIconLayer({
                  ...this.getDefaultHoverLayerProps(),
                  ...layerProps,
                  data: [hoveredObject],
                  parameters,
                  getPosition: data.getPosition,
                  getRadius: data.getRadius,
                  getFillColor: this.config.highlightColor,
                  getIconGeometry: id => this.iconGeometry[id]
                })
              ]
            : []),

          // text label layer
          ...labelLayers
        ];
  }
}

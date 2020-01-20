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

import React, {Component} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import {Tooltip} from 'components/common/styled-components';
import KeplerGlLogo from 'components/common/logo';
import {
  Save,
  DataTable,
  Save2,
  Gear,
  Picture,
  Db,
  Map as MapIcon
} from 'components/common/icons';
import ClickOutsideCloseDropdown from 'components/side-panel/panel-dropdown';

const StyledPanelHeader = styled.div.attrs({
  className: 'side-side-panel__header'
})`
  background-color: ${props => props.theme.sidePanelHeaderBg};
  padding: 12px 16px 0 16px;
`;

const StyledPanelHeaderTop = styled.div.attrs({
  className: 'side-panel__header__top'
})`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  width: 100%;
`;

const StyledPanelTopActions = styled.div.attrs({
  className: 'side-panel__top__actions'
})`
  display: flex;
`;

const StyledPanelAction = styled.div.attrs({
  className: 'side-panel__panel-header__action'
})`
  align-items: center;
  border-radius: 2px;
  color: ${props =>
    props.active ? props.theme.textColorHl : props.theme.subtextColor};
  display: flex;
  height: 26px;
  justify-content: space-between;
  margin-left: 4px;
  padding: 5px;
  font-weight: bold;
  p {
    display: inline-block;
    margin-right: 6px;
  }
  a {
    height: 20px;
  }

  :hover {
    cursor: pointer;
    background-color: ${props => props.theme.secondaryBtnActBgd};
    color: ${props => props.theme.textColorHl};

    a {
      color: ${props => props.theme.textColorHl};
    }
  }
`;

const StyledPanelDropdown = styled.div`
  background-color: ${props => props.theme.dropdownListBgd};
  box-shadow: ${props => props.theme.dropdownListShadow};
  font-size: 11px;
  padding: 16px 0;
  position: absolute;
  left: 64px;
  transition: ${props => props.theme.transitionSlow};
  display: flex;
  margin-top: ${props => (props.show ? '6px' : '20px')};
  opacity: ${props => (props.show ? 1 : 0)};
  transform: translateX(calc(-50% + 20px));
  pointer-events: ${props => (props.show ? 'all' : 'none')};
  z-index: 1000;

  .panel-header-dropdown__inner {
    box-shadow: none;
    background-color: transparent;
    display: flex;
  }

  .panel-header-dropdown__item {
    align-items: center;
    border-right: 1px solid ${props => props.theme.panelHeaderIcon};
    color: ${props => props.theme.textColor};
    display: flex;
    flex-direction: column;
    padding: 0 22px;

    :hover {
      cursor: pointer;
      color: ${props => props.theme.textColorHl};
    }

    &:last-child {
      border-right: 0;
    }
  }

  .panel-header-dropdown__title {
    white-space: nowrap;
    margin-top: 4px;
  }
`;

export const PanelAction = ({item, onClick}) => (
  <StyledPanelAction
    className="side-panel__panel-header__action"
    data-tip
    data-for={`${item.id}-action`}
    onClick={onClick}
  >
    {item.label ? <p>{item.label}</p> : null}
    <a target={item.blank ? '_blank' : ''} href={item.href}>
      <item.iconComponent height="20px" />
    </a>
    {item.tooltip ? (
      <Tooltip
        id={`${item.id}-action`}
        place="bottom"
        delayShow={500}
        effect="solid"
      >
        <span>{item.tooltip}</span>
      </Tooltip>
    ) : null}
  </StyledPanelAction>
);

const PanelItem = props => (
  <div
    className="panel-header-dropdown__item"
    onClick={e => {
      e.stopPropagation();
      props.onClose();
      props.onClickHandler();
    }}
  >
    <props.icon />
    <div className="panel-header-dropdown__title">{props.label}</div>
  </div>
);

export const PanelHeaderDropdownFactory = () => {
  const PanelHeaderDropdown = ({items, show, onClose, id}) => {
    return (
      <StyledPanelDropdown show={show} className={`${id}-dropdown`}>
        <ClickOutsideCloseDropdown
          className="panel-header-dropdown__inner"
          show={show}
          onClose={onClose}
        >
          {items.map(itm => (
            <PanelItem
              key={itm.key}
              label={itm.label}
              icon={itm.icon}
              onClickHandler={itm.onClick}
              onClose={onClose}
            />
          ))}
        </ClickOutsideCloseDropdown>
      </StyledPanelDropdown>
    );
  };

  return PanelHeaderDropdown;
};

const getDropdownItemsSelector = () =>
  createSelector(
    props => props,
    props =>
      props.items
        .map(t => ({
          ...t,
          onClick: t.onClick && t.onClick(props) ? t.onClick(props) : null
        }))
        .filter(l => l.onClick)
  );

export const SaveExportDropdownFactory = PanelHeaderDropdown => {
  const dropdownItemsSelector = getDropdownItemsSelector();

  const SaveExportDropdown = props => (
    <PanelHeaderDropdown
      items={dropdownItemsSelector(props)}
      show={props.show}
      onClose={props.onClose}
      id="save-export"
    />
  );

  SaveExportDropdown.defaultProps = {
    items: [
      {
        label: 'Export Image',
        icon: Picture,
        key: 'image',
        onClick: props => props.onExportImage
      },
      {
        label: 'Export Data',
        icon: DataTable,
        key: 'data',
        onClick: props => props.onExportData
      },
      {
        label: 'Export Map',
        icon: MapIcon,
        key: 'map',
        onClick: props => props.onExportMap
      },
      {
        label: 'Save Map',
        icon: Save2,
        key: 'save',
        onClick: props => props.onSaveMap
      }
    ]
  };

  return SaveExportDropdown;
};
SaveExportDropdownFactory.deps = [PanelHeaderDropdownFactory];

export const CloudStorageDropdownFactory = PanelHeaderDropdown => {
  const dropdownItemsSelector = getDropdownItemsSelector();

  const CloudStorageDropdown = (props) => (
    <PanelHeaderDropdown
      items={dropdownItemsSelector(props)}
      show={props.show}
      onClose={props.onClose}
      id="cloud-storage"
    />
  );
  CloudStorageDropdown.defaultProps = {
    items: [
      {
        label: 'Save',
        icon: Save2,
        key: 'data',
        onClick: props => props.onSaveToStorage
      },
      {
        label: 'Settings',
        icon: Gear,
        key: 'settings',
        onClick: props => props.onExportData
      }
    ]
  };
  return CloudStorageDropdown;
};
CloudStorageDropdownFactory.deps = [PanelHeaderDropdownFactory];

PanelHeaderFactory.deps = [
  SaveExportDropdownFactory,
  CloudStorageDropdownFactory
];

function PanelHeaderFactory(SaveExportDropdown, CloudStorageDropdown) {
  return class PanelHeader extends Component {
    static propTypes = {
      appName: PropTypes.string,
      version: PropTypes.string,
      visibleDropdown: PropTypes.string,
      logoComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
      actionItems: PropTypes.arrayOf(PropTypes.any),
      onExportImage: PropTypes.func,
      onExportData: PropTypes.func,
      onExportConfig: PropTypes.func,
      onExportMap: PropTypes.func,
      onSaveToStorage: PropTypes.func,
      onSaveMap: PropTypes.func
    };

    static defaultProps = {
      logoComponent: KeplerGlLogo,
      actionItems: [
        {
          id: 'storage',
          iconComponent: Db,
          tooltip: 'Cloud Storage',
          onClick: () => {},
          dropdownComponent: CloudStorageDropdown
        },
        {
          id: 'save',
          iconComponent: Save,
          onClick: () => {},
          label: 'Share',
          dropdownComponent: SaveExportDropdown
        }
      ]
    };

    render() {
      const {
        appName,
        version,
        actionItems,
        onSaveToStorage,
        onSaveMap,
        onExportImage,
        onExportData,
        onExportConfig,
        onExportMap,
        visibleDropdown,
        showExportDropdown,
        hideExportDropdown
      } = this.props;

      return (
        <StyledPanelHeader className="side-panel__panel-header">
          <StyledPanelHeaderTop className="side-panel__panel-header__top">
            <this.props.logoComponent appName={appName} version={version} />
            <StyledPanelTopActions>
              {actionItems.map(item => (
                <div
                  className="side-panel__panel-header__right"
                  key={item.id}
                  style={{position: 'relative'}}
                >
                  <PanelAction
                    item={item}
                    onClick={() => {
                      if (item.dropdownComponent) {
                        showExportDropdown(item.id);
                      }
                      item.onClick();
                    }}
                  />
                  {item.dropdownComponent ? (
                    <item.dropdownComponent
                      onClose={hideExportDropdown}
                      show={visibleDropdown === item.id}
                      onSaveToStorage={onSaveToStorage}
                      onSaveMap={onSaveMap}
                      onExportData={onExportData}
                      onExportImage={onExportImage}
                      onExportConfig={onExportConfig}
                      onExportMap={onExportMap}
                    />
                  ) : null}
                </div>
              ))}
            </StyledPanelTopActions>
          </StyledPanelHeaderTop>
        </StyledPanelHeader>
      );
    }
  };
}

export default PanelHeaderFactory;

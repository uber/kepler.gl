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
import PropTypes from 'prop-types';
import {css} from 'styled-components';
import {findDOMNode} from 'react-dom';
import {createSelector} from 'reselect';
import get from 'lodash.get';
import document from 'global/document';

import {EXPORT_DATA_TYPE_OPTIONS} from 'constants/default-settings';
import ModalDialogFactory from './modals/modal-dialog';
import {exportJson, exportHtml, exportData, exportImage, exportMap} from 'utils/export-utils';
import {isValidMapInfo} from 'utils/map-info-utils';

// modals
import DeleteDatasetModalFactory from './modals/delete-data-modal';
import OverWriteMapModalFactory from './modals/overwrite-map-modal';
import DataTableModalFactory from './modals/data-table-modal';
import LoadDataModalFactory from './modals/load-data-modal';
import ExportImageModalFactory from './modals/export-image-modal';
import ExportDataModalFactory from './modals/export-data-modal';
import ExportMapModalFactory from './modals/export-map-modal/export-map-modal';
import AddMapStyleModalFactory from './modals/add-map-style-modal';
import SaveMapModalFactory from './modals/save-map-modal';
import ShareMapModalFactory from './modals/share-map-modal';

// Breakpoints
import {media} from 'styles/media-breakpoints';

// Template
import {
  ADD_DATA_ID,
  DATA_TABLE_ID,
  DELETE_DATA_ID,
  EXPORT_DATA_ID,
  EXPORT_IMAGE_ID,
  EXPORT_MAP_ID,
  ADD_MAP_STYLE_ID,
  SAVE_MAP_ID,
  SHARE_MAP_ID,
  OVERWRITE_MAP_ID
} from 'constants/default-settings';
import {EXPORT_MAP_FORMATS} from 'constants/default-settings';
import KeyEvent from 'constants/keyevent';
import {getFileFormatNames, getFileExtensions} from '../reducers/vis-state-selectors';

const DataTableModalStyle = css`
  top: 80px;
  padding: 32px 0 0 0;
  width: 90vw;
  max-width: 90vw;

  ${media.portable`
    padding: 0;
  `} ${media.palm`
    padding: 0;
    margin: 0 auto;
  `};
`;
const smallModalCss = css`
  width: 40%;
  padding: 40px 40px 32px 40px;
`;

const LoadDataModalStyle = css`
  top: 60px;
`;

const DefaultStyle = css`
  max-width: 960px;
`;

ModalContainerFactory.deps = [
  DeleteDatasetModalFactory,
  OverWriteMapModalFactory,
  DataTableModalFactory,
  LoadDataModalFactory,
  ExportImageModalFactory,
  ExportDataModalFactory,
  ExportMapModalFactory,
  AddMapStyleModalFactory,
  ModalDialogFactory,
  SaveMapModalFactory,
  ShareMapModalFactory
];

export default function ModalContainerFactory(
  DeleteDatasetModal,
  OverWriteMapModal,
  DataTableModal,
  LoadDataModal,
  ExportImageModal,
  ExportDataModal,
  ExportMapModal,
  AddMapStyleModal,
  ModalDialog,
  SaveMapModal,
  ShareMapModal
) {
  /** @typedef {import('./modal-container').ModalContainerProps} ModalContainerProps */
  /** @augments React.Component<ModalContainerProps> */
  class ModalContainer extends Component {
    // TODO - remove when prop types are fully exported
    static propTypes = {
      rootNode: PropTypes.object,
      containerW: PropTypes.number,
      containerH: PropTypes.number,
      mapboxApiAccessToken: PropTypes.string.isRequired,
      mapboxApiUrl: PropTypes.string,
      mapState: PropTypes.object.isRequired,
      mapStyle: PropTypes.object.isRequired,
      uiState: PropTypes.object.isRequired,
      visState: PropTypes.object.isRequired,
      visStateActions: PropTypes.object.isRequired,
      uiStateActions: PropTypes.object.isRequired,
      mapStyleActions: PropTypes.object.isRequired,
      onSaveToStorage: PropTypes.func,
      cloudProviders: PropTypes.arrayOf(PropTypes.object)
    };
    componentDidMount = () => {
      document.addEventListener('keyup', this._onKeyUp);
    };
    componentWillUnmount() {
      document.removeEventListener('keyup', this._onKeyUp);
    }

    cloudProviders = props => props.cloudProviders;
    providerWithStorage = createSelector(this.cloudProviders, cloudProviders =>
      cloudProviders.filter(p => p.hasPrivateStorage())
    );
    providerWithShare = createSelector(this.cloudProviders, cloudProviders =>
      cloudProviders.filter(p => p.hasSharingUrl())
    );

    _onKeyUp = event => {
      const keyCode = event.keyCode;
      if (keyCode === KeyEvent.DOM_VK_ESCAPE) {
        this._closeModal();
      }
    };

    _closeModal = () => {
      this.props.uiStateActions.toggleModal(null);
    };

    _deleteDataset = key => {
      this.props.visStateActions.removeDataset(key);
      this._closeModal();
    };

    _onAddCustomMapStyle = () => {
      this.props.mapStyleActions.addCustomMapStyle();
      this._closeModal();
    };

    _onFileUpload = fileList => {
      this.props.visStateActions.loadFiles(fileList);
    };

    _onExportImage = () => {
      if (!this.props.uiState.exportImage.processing) {
        exportImage(this.props, `${this.props.appName}.png`);
        this.props.uiStateActions.cleanupExportImage();
        this._closeModal();
      }
    };

    _onExportData = () => {
      exportData(this.props, this.props.uiState.exportData);
      this._closeModal();
    };

    _onExportMap = () => {
      const {uiState} = this.props;
      const {format} = uiState.exportMap;
      (format === EXPORT_MAP_FORMATS.HTML ? exportHtml : exportJson)(
        this.props,
        this.props.uiState.exportMap[format] || {}
      );
      this._closeModal();
    };

    _exportFileToCloud = ({provider, isPublic, overwrite, closeModal}) => {
      const toSave = exportMap(this.props);

      this.props.providerActions.exportFileToCloud({
        // @ts-ignore
        mapData: toSave,
        provider,
        options: {
          isPublic,
          overwrite
        },
        closeModal,
        onSuccess: this.props.onExportToCloudSuccess,
        onError: this.props.onExportToCloudError
      });
    };

    _onSaveMap = (overwrite = false) => {
      const {currentProvider} = this.props.providerState;
      // @ts-ignore
      const provider = this.props.cloudProviders.find(p => p.name === currentProvider);
      this._exportFileToCloud({
        provider,
        isPublic: false,
        overwrite,
        closeModal: true
      });
    };

    _onOverwriteMap = () => {
      this._onSaveMap(true);
    };

    _onShareMapUrl = provider => {
      this._exportFileToCloud({provider, isPublic: true, overwrite: false, closeModal: false});
    };

    _onCloseSaveMap = () => {
      this.props.providerActions.resetProviderStatus();
      this._closeModal();
    };

    _onLoadCloudMap = payload => {
      this.props.providerActions.loadCloudMap({
        ...payload,
        onSuccess: this.props.onLoadCloudMapSuccess,
        onError: this.props.onLoadCloudMapError
      });
    };

    /* eslint-disable complexity */
    render() {
      const {
        containerW,
        containerH,
        mapStyle,
        mapState,
        uiState,
        visState,
        rootNode,
        visStateActions,
        uiStateActions,
        providerState
      } = this.props;
      const {currentModal, datasetKeyToRemove} = uiState;
      const {datasets, layers, editingDataset} = visState;

      let template = null;
      let modalProps = {};

      // TODO - currentModal is a string
      // @ts-ignore
      if (currentModal && currentModal.id && currentModal.template) {
        // if currentMdoal template is already provided
        // TODO: need to check whether template is valid
        // @ts-ignore
        template = <currentModal.template />;
        // @ts-ignore
        modalProps = currentModal.modalProps;
      } else {
        switch (currentModal) {
          case DATA_TABLE_ID:
            const width = containerW * 0.9;
            template = (
              <DataTableModal
                width={containerW * 0.9}
                height={containerH * 0.85}
                datasets={datasets}
                dataId={editingDataset}
                showDatasetTable={visStateActions.showDatasetTable}
                sortTableColumn={visStateActions.sortTableColumn}
                pinTableColumn={visStateActions.pinTableColumn}
                copyTableColumn={visStateActions.copyTableColumn}
              />
            );

            // TODO: we need to make this width consistent with the css rule defined modal.js:32 max-width: 70vw
            modalProps.cssStyle = css`
              ${DataTableModalStyle};
              ${media.palm`
                width: ${width}px;
              `};
            `;
            break;
          case DELETE_DATA_ID:
            // validate options
            if (datasetKeyToRemove && datasets && datasets[datasetKeyToRemove]) {
              template = (
                <DeleteDatasetModal dataset={datasets[datasetKeyToRemove]} layers={layers} />
              );
              modalProps = {
                title: 'modal.title.deleteDataset',
                cssStyle: smallModalCss,
                footer: true,
                onConfirm: () => this._deleteDataset(datasetKeyToRemove),
                onCancel: this._closeModal,
                confirmButton: {
                  negative: true,
                  large: true,
                  children: 'modal.button.delete'
                }
              };
            }
            break; // in case we add a new case after this one
          case ADD_DATA_ID:
            template = (
              <LoadDataModal
                {...providerState}
                onClose={this._closeModal}
                onFileUpload={this._onFileUpload}
                onLoadCloudMap={this._onLoadCloudMap}
                cloudProviders={this.providerWithStorage(this.props)}
                onSetCloudProvider={this.props.providerActions.setCloudProvider}
                getSavedMaps={this.props.providerActions.getSavedMaps}
                loadFiles={uiState.loadFiles}
                fileLoading={visState.fileLoading}
                fileLoadingProgress={visState.fileLoadingProgress}
                fileFormatNames={getFileFormatNames(this.props.visState)}
                fileExtensions={getFileExtensions(this.props.visState)}
              />
            );
            modalProps = {
              title: 'modal.title.addDataToMap',
              cssStyle: LoadDataModalStyle,
              footer: false,
              onConfirm: this._closeModal
            };
            break;
          case EXPORT_IMAGE_ID:
            template = (
              <ExportImageModal
                exportImage={uiState.exportImage}
                mapW={containerW}
                mapH={containerH}
                onUpdateImageSetting={uiStateActions.setExportImageSetting}
                cleanupExportImage={uiStateActions.cleanupExportImage}
              />
            );
            modalProps = {
              title: 'modal.title.exportImage',
              cssStyle: '',
              footer: true,
              onCancel: this._closeModal,
              onConfirm: this._onExportImage,
              confirmButton: {
                large: true,
                disabled: uiState.exportImage.processing,
                children: 'modal.button.download'
              }
            };
            break;
          case EXPORT_DATA_ID:
            template = (
              <ExportDataModal
                {...uiState.exportData}
                supportedDataTypes={EXPORT_DATA_TYPE_OPTIONS}
                datasets={datasets}
                applyCPUFilter={this.props.visStateActions.applyCPUFilter}
                onClose={this._closeModal}
                onChangeExportDataType={uiStateActions.setExportDataType}
                onChangeExportSelectedDataset={uiStateActions.setExportSelectedDataset}
                onChangeExportFiltered={uiStateActions.setExportFiltered}
              />
            );
            modalProps = {
              title: 'modal.title.exportData',
              cssStyle: '',
              footer: true,
              onCancel: this._closeModal,
              onConfirm: this._onExportData,
              confirmButton: {
                large: true,
                children: 'modal.button.export'
              }
            };
            break;
          case EXPORT_MAP_ID:
            const keplerGlConfig = visState.schema.getConfigToSave({
              mapStyle,
              visState,
              mapState,
              uiState
            });
            template = (
              <ExportMapModal
                config={keplerGlConfig}
                options={uiState.exportMap}
                onChangeExportMapFormat={uiStateActions.setExportMapFormat}
                onEditUserMapboxAccessToken={uiStateActions.setUserMapboxAccessToken}
                onChangeExportMapHTMLMode={uiStateActions.setExportHTMLMapMode}
              />
            );
            modalProps = {
              title: 'modal.title.exportMap',
              cssStyle: '',
              footer: true,
              onCancel: this._closeModal,
              onConfirm: this._onExportMap,
              confirmButton: {
                large: true,
                children: 'modal.button.export'
              }
            };
            break;
          case ADD_MAP_STYLE_ID:
            template = (
              <AddMapStyleModal
                mapboxApiAccessToken={this.props.mapboxApiAccessToken}
                mapboxApiUrl={this.props.mapboxApiUrl}
                mapState={this.props.mapState}
                inputStyle={mapStyle.inputStyle}
                inputMapStyle={this.props.mapStyleActions.inputMapStyle}
                loadCustomMapStyle={this.props.mapStyleActions.loadCustomMapStyle}
              />
            );
            modalProps = {
              title: 'modal.title.addCustomMapboxStyle',
              cssStyle: '',
              footer: true,
              onCancel: this._closeModal,
              onConfirm: this._onAddCustomMapStyle,
              confirmButton: {
                large: true,
                disabled: !mapStyle.inputStyle.style,
                children: 'modal.button.addStyle'
              }
            };
            break;
          case SAVE_MAP_ID:
            template = (
              <SaveMapModal
                {...providerState}
                exportImage={uiState.exportImage}
                mapInfo={visState.mapInfo}
                onSetMapInfo={visStateActions.setMapInfo}
                cloudProviders={this.providerWithStorage(this.props)}
                onSetCloudProvider={this.props.providerActions.setCloudProvider}
                cleanupExportImage={uiStateActions.cleanupExportImage}
                onUpdateImageSetting={uiStateActions.setExportImageSetting}
              />
            );
            modalProps = {
              title: 'modal.title.saveMap',
              cssStyle: '',
              footer: true,
              onCancel: this._closeModal,
              onConfirm: () => this._onSaveMap(false),
              confirmButton: {
                large: true,
                disabled:
                  uiState.exportImage.processing ||
                  !isValidMapInfo(visState.mapInfo) ||
                  !providerState.currentProvider,
                children: 'modal.button.save'
              }
            };
            break;
          case OVERWRITE_MAP_ID:
            template = (
              <OverWriteMapModal
                {...providerState}
                cloudProviders={this.props.cloudProviders}
                title={get(visState, ['mapInfo', 'title'])}
                onSetCloudProvider={this.props.providerActions.setCloudProvider}
                onUpdateImageSetting={uiStateActions.setExportImageSetting}
                cleanupExportImage={uiStateActions.cleanupExportImage}
              />
            );
            modalProps = {
              title: 'Overwrite Existing File?',
              cssStyle: smallModalCss,
              footer: true,
              onConfirm: this._onOverwriteMap,
              onCancel: this._closeModal,
              confirmButton: {
                large: true,
                children: 'Yes',
                disabled:
                  uiState.exportImage.processing ||
                  !isValidMapInfo(visState.mapInfo) ||
                  !providerState.currentProvider
              }
            };
            break;
          case SHARE_MAP_ID:
            template = (
              <ShareMapModal
                {...providerState}
                isReady={!uiState.exportImage.processing}
                cloudProviders={this.providerWithShare(this.props)}
                onExport={this._onShareMapUrl}
                onSetCloudProvider={this.props.providerActions.setCloudProvider}
                cleanupExportImage={uiStateActions.cleanupExportImage}
                onUpdateImageSetting={uiStateActions.setExportImageSetting}
              />
            );
            modalProps = {
              title: 'modal.title.shareURL',
              cssStyle: '',
              onCancel: this._onCloseSaveMap
            };
            break;
          default:
            break;
        }
      }

      return this.props.rootNode ? (
        <ModalDialog
          parentSelector={() => findDOMNode(rootNode)}
          isOpen={Boolean(currentModal)}
          onCancel={this._closeModal}
          {...modalProps}
          cssStyle={DefaultStyle.concat(modalProps.cssStyle)}
        >
          {template}
        </ModalDialog>
      ) : null;
    }
    /* eslint-enable complexity */
  }

  return ModalContainer;
}

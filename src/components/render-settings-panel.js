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
import styled, {withTheme} from 'styled-components';
import {Button, Input} from 'kepler.gl/components/common/styled-components';
import {Delete} from 'kepler.gl/components/common/icons';
import ItemSelector from 'kepler.gl/components/common/item-selector/item-selector';
import {Scene} from 'components/scene'; 

import {
  WebMEncoder,
  JPEGSequenceEncoder,
  PNGSequenceEncoder,
  PreviewEncoder,
  GifEncoder
} from '@hubble.gl/core';
import {DeckScene, CameraKeyframes} from '@hubble.gl/core';
import {easing} from 'popmotion';
import {DeckAdapter, ScatterPlotLayerKeyframes} from 'hubble.gl';

import {DEFAULT_TIME_FORMAT} from 'constants';
import moment from 'moment';

const DEFAULT_BUTTON_HEIGHT = '32px';
const DEFAULT_BUTTON_WIDTH = '64px';
const DEFAULT_PADDING = '32px';
const DEFAULT_ROW_GAP = '16px';

//const keyframes = setKeyframes(camera);
let adapter = new DeckAdapter(sceneBuilder);
let mapdataGlobal = null;

function sceneBuilder(animationLoop) {
  const data = {};
  const keyframes = {
    camera: new CameraKeyframes({
      timings: [0, 1000],
      keyframes: [
        {
          longitude: mapdataGlobal.mapState.longitude,
          latitude: mapdataGlobal.mapState.latitude,
          zoom: mapdataGlobal.mapState.zoom,
          pitch: 0,
          bearing: 0
        },
        {
          longitude: mapdataGlobal.mapState.longitude,
          latitude: mapdataGlobal.mapState.latitude,
          zoom: mapdataGlobal.mapState.zoom,
          bearing: 0,
          pitch: 0
        }
      ],
      easings: [easing.easeInOut]
    })
  };
  animationLoop.timeline.attachAnimation(keyframes.camera);

  // TODO: Figure out how to set up the size 
  return new DeckScene({
    animationLoop,
    keyframes,
    lengthMs: 1000,
    data,
   width: 480,
   height: 460
  });
}

function setKeyframes(cameraType){
  adapter.scene.keyframes.camera._lastTime = 0;
  adapter.scene.keyframes.camera.factor = 0;

  // I'm not sure
  adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
  adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
  adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
  adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
  adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;
  adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
  
      if(cameraType === 'Orbit (90º)'){
          // How to reset the camera to its initial position?
          adapter.scene.keyframes.camera.values[0].bearing = 0;
          adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
          adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
          adapter.scene.keyframes.camera.values[0].pitch = 0;
          adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;
  
          adapter.scene.keyframes.camera.values[1].bearing = 90;
          adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
          adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
          adapter.scene.keyframes.camera.values[1].pitch = 0;
          adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'Orbit (180º)'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 180;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'Orbit (360º)'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 360;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'North to South'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude + 25;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 0;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude - 25;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'South to North'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude - 25;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 0;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude + 25;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'East to West'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude + 25;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 0;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude - 25;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'West to East'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude - 25;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 0;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude + 25;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;
      }else if(cameraType === 'Zoom Out'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 0;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom - 2;
      }else if(cameraType === 'Zoom In'){
        adapter.scene.keyframes.camera.values[0].bearing = 0;
        adapter.scene.keyframes.camera.values[0].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[0].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[0].pitch = 0;
        adapter.scene.keyframes.camera.values[0].zoom = mapdataGlobal.mapState.zoom;

        adapter.scene.keyframes.camera.values[1].bearing = 0;
        adapter.scene.keyframes.camera.values[1].latitude = mapdataGlobal.mapState.latitude;
        adapter.scene.keyframes.camera.values[1].longitude = mapdataGlobal.mapState.longitude;
        adapter.scene.keyframes.camera.values[1].pitch = 0;
        adapter.scene.keyframes.camera.values[1].zoom = mapdataGlobal.mapState.zoom + 2;
      }      
     console.log("adapter", adapter);
}

const encoderSettings = {
  framerate: 30,
  webm: {
    quality: 0.8
  },
  jpeg: {
    quality: 0.8
  },
  gif: {
    sampleInterval: 1000
  },
  webm:{
    quality: 1.5
  },
  filename: "Default Video Name" + " " + moment().format(DEFAULT_TIME_FORMAT).toString()
};

function preview() {
  adapter.render(PreviewEncoder, encoderSettings, ()=>{});
}

function setFileNameDeckAdapter(name){
  console.log(mapdataGlobal);
  encoderSettings.filename = name + " " + moment().format(DEFAULT_TIME_FORMAT).toString();
}

/*function setResolution(resolution){
  if(resolution === 'Good (540p)'){
    adapter.scene.width = 960;
    adapter.scene.height = 540;
  }else if(resolution === 'High (720p)'){
    adapter.scene.width = 1280;
    adapter.scene.height = 720;
  }else if(resolution === 'Highest (1080p)'){
    adapter.scene.width = 1920;
    adapter.scene.height = 1080;
  }
}*/

// This is temporary, for showing purposes on Friday, resolution settings should be in a separate function, 
// only because we are against the clock. 
// TODO: refactor
function render(settingsdata){

  //  setResolution(settingsdata.resolution); // Remove this

    if (settingsdata.mediaType === 'WebM Video') {
      adapter.render(WebMEncoder, encoderSettings, () => {});
    } else if (settingsdata.mediaType === 'PNG Sequence') {
      adapter.render(PNGSequenceEncoder, encoderSettings, () => {});
    } else if (settingsdata.mediaType === 'JPEG Sequence') {
      adapter.render(JPEGSequenceEncoder, encoderSettings, () => {});
    } 
  // preview();
  }

// TODO:

// Changes Timestamp function
// Camera function (preset keyframes) DONE
// File Name function DONE
// MediaType function DONE
// Quality function
// Set Duration function
// Calculate File Size function
// Render Function DONE

function nop() {}

const IconButton = styled(Button)`
  padding: 0;
  svg {
    margin: 0;
  }
`;

const PanelCloseInner = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${DEFAULT_PADDING} ${DEFAULT_PADDING} 0 ${DEFAULT_PADDING};
`;

const PanelClose = ({buttonHeight, handleClose}) => (
  <PanelCloseInner className="render-settings-panel__close" >
    <IconButton className="render-settings-panel__button" link onClick={() => {handleClose()}}>
      <Delete height={buttonHeight} />
    </IconButton>
  </PanelCloseInner>
);

const StyledTitle = styled.div`
  color: ${props => props.theme.titleTextColor};
  font-size: 20px;
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight};
  padding: 0 ${DEFAULT_PADDING} 16px ${DEFAULT_PADDING};
`;

const StyledSection = styled.div`
  align-self: center;
  color: ${props => props.theme.labelColor};
  font-weight: 500;
  font-size: 13px;
  margin-top: ${DEFAULT_PADDING};
  margin-bottom: ${DEFAULT_ROW_GAP};
`;

const StyledLabelCell = styled.div`
  align-self: center;
  color: ${props => props.theme.labelColor};
  font-weight: 400;
  font-size: 11px;
`;

const StyledValueCell = styled.div`
  align-self: center;
  color: ${props => props.theme.textColor};
  font-weight: 500;
  font-size: 11px;
  padding: 0 12px;
`;

const PanelBodyInner = styled.div`
  padding: 0 ${DEFAULT_PADDING};
  display: grid;
  grid-template-columns: 480px auto;
  grid-column-gap: 20px;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 88px auto;
  grid-template-rows: repeat(
    ${props => props.rows},
    ${props => (props.rowHeight ? props.rowHeight : '34px')}
  );
  grid-row-gap: ${DEFAULT_ROW_GAP};
`;

const PanelBody = ({mapData, setMediaType, setCamera, setFileName/*, setQuality*/, settingsData}) => (
  <PanelBodyInner className="render-settings-panel__body"> 
     <div style={{width: "480px", height: "460px"}}>
       <Scene mapData={mapData} encoderSettings={encoderSettings} adapter={adapter} /*ref={sce}*//> 
    </div>
    <div>
    <StyledSection>Video Effects</StyledSection>
    <InputGrid rows={2}>
      <StyledLabelCell>Timestamp</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={['None']}
        options={['None', 'White', 'Black']}
        multiSelect={false}
        searchable={false}
      />
      <StyledLabelCell>Camera</StyledLabelCell> {/* TODO add functionality */}
      <ItemSelector
        selectedItems={settingsData.camera}
        options={[
          'None',
          'Orbit (90º)',
          'Orbit (180º)',
          'Orbit (360º)',
          'North to South',
          'South to North',
          'East to West',
          'West to East',
          'Zoom Out',
          'Zoom In'
        ]}
        multiSelect={false}
        searchable={false}
        onChange={setCamera}
      />
    </InputGrid>
    <StyledSection>Export Settings</StyledSection> {/* TODO add functionality  */}
    <InputGrid rows={3}>
      <StyledLabelCell>File Name</StyledLabelCell>
      <Input placeholder={settingsData.fileName} onChange={setFileName}/>
      <StyledLabelCell>Media Type</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={settingsData.mediaType}
        options={['WebM Video', 'PNG Sequence', 'JPEG Sequence']}
        multiSelect={false}
        searchable={false}
        onChange={setMediaType}
      />
      <StyledLabelCell>Quality</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={settingsData.resolution}
        options={['Good (540p)', 'High (720p)', 'Highest (1080p)']}
        multiSelect={false}
        searchable={false}
       /* onChange={setQuality}*/
      />
    </InputGrid>
    <InputGrid style={{marginTop: DEFAULT_ROW_GAP}} rows={2} rowHeight="18px">
      <StyledLabelCell>Duration</StyledLabelCell> {/* TODO add functionality  */}
      <StyledValueCell>00:00:30</StyledValueCell> 
      <StyledLabelCell>File Size</StyledLabelCell> {/* TODO add functionality  */}
      <StyledValueCell>36 MB</StyledValueCell>
    </InputGrid>
    </div>
  </PanelBodyInner>
);

const PanelFooterInner = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${DEFAULT_ROW_GAP};
  padding: ${DEFAULT_PADDING};
`;

const ButtonGroup = styled.div`
  display: flex;
`;

const PanelFooter = ({handleClose, settingsData}) => (
  <PanelFooterInner className="render-settings-panel__footer">
    <Button
      width={DEFAULT_BUTTON_WIDTH}
      height={DEFAULT_BUTTON_HEIGHT}
      secondary
      className={'render-settings-button'}
      onClick={preview}
    >
      Preview
    </Button>
    <ButtonGroup>
      <Button
        width={DEFAULT_BUTTON_WIDTH}
        height={DEFAULT_BUTTON_HEIGHT}
        link
        className={'render-settings-button'}
        onClick={() => {handleClose()}}
      >
        Cancel {/* TODO add functionality to close  */}
      </Button>
      <Button
        width={DEFAULT_BUTTON_WIDTH}
        height={DEFAULT_BUTTON_HEIGHT}
        className={'render-settings-button'}
        onClick={() => render(settingsData)}
      >
        Render
      </Button>
    </ButtonGroup>
  </PanelFooterInner>
);

const Panel = styled.div`
  width: ${props => props.settingsWidth}px;
`;

class RenderSettingsPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaType: "WebM Video",
      camera: "None",
      fileName: "Video Name",
    //  quality: "High (720p)"
    };

    this.setMediaTypeState = this.setMediaTypeState.bind(this);
    this.setCamera = this.setCamera.bind(this);
    this.setFileName = this.setFileName.bind(this);
   // this.setQuality = this.setQuality.bind(this);
   mapdataGlobal = this.props.mapData;
  }

  static defaultProps = {
    settingsWidth: 980,
    buttonHeight: '16px'
  };

  setMediaTypeState(media){
    this.setState({
      mediaType: media
    });
  }
  setCamera(option){
      this.setState({
        camera: option
      });
      setKeyframes(option);
  }
  setFileName(name){
    this.setState({
      fileName: name.target.value
    });
    setFileNameDeckAdapter(name.target.value);
  }
 /* setQuality(resolution){
    this.setState({
      quality: resolution
    });
    setResolution(resolution);
  }*/

  
  render() {

    const {buttonHeight, settingsWidth, handleClose} = this.props;
    const settingsData = {
      mediaType : this.state.mediaType,
      camera : this.state.camera,
      fileName: this.state.fileName,
      resolution: this.state.quality,
    }
   
    return (
    
      <Panel settingsWidth={settingsWidth} className="render-settings-panel">
        <PanelClose 
            buttonHeight={buttonHeight} 
            handleClose={handleClose}/> {/* handleClose for X button */}
        <StyledTitle className="render-settings-panel__title">Export Video</StyledTitle>  
        <PanelBody 
            mapData={this.props.mapData} 
            setMediaType={this.setMediaTypeState} 
            setCamera={this.setCamera}
            setFileName={this.setFileName}
          //  setQuality={this.setQuality}
            settingsData={settingsData}
            />
        <PanelFooter 
            handleClose={handleClose} 
            settingsData = {settingsData}
            /> {/* handleClose for Cancel button */}
      </Panel>
    );
  }
}

export default withTheme(RenderSettingsPanel);
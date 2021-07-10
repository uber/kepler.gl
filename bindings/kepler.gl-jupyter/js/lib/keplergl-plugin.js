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

import * as widgets from '@jupyter-widgets/base';
import KeplerGlJupyter from './keplergl/kepler.gl';
import log from './log';

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.

export const KeplerGlModal = widgets.DOMWidgetModel.extend({
  defaults: {
    ...widgets.DOMWidgetModel.prototype.defaults(),
    _model_name: 'KeplerGlModal',
    _view_name: 'KeplerGlView',
    _model_module: 'keplergl-jupyter',
    _view_module: 'keplergl-jupyter',

    data: {},
    config: {},
    _exported_map: {}
  }
});

export const KeplerGlView = widgets.DOMWidgetView.extend({
  render() {
    log('KeplerGlModal start render');
    this.keplergl = new KeplerGlJupyter();

    this.keplergl.create(this);

    // event listener
    this.model.on('change:data', this.data_changed, this);
    this.model.on('change:config', this.config_changed, this);
    this.model.on('custom', this.export_map, this)

    window.dom = this.el;
  },

  data_changed() {
    log('KeplerGlModal start data_changed');

    this.keplergl.onDataChange(this);
  },

  config_changed() {
    log('KeplerGlModal start config_change');

    this.keplergl.onConfigChange(this);
  },

  export_map(content) {
    console.log("HI", content)
    if (content === 'export_map') {
      this.model.set('_exported_map', this.keplergl.exportMap())
      this.model.save_changes()
    }
  }
});

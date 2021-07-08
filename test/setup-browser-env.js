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

/* setup.js */
import {JSDOM, VirtualConsole} from 'jsdom';
import global from 'global';

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  // JSDom 11.12 causes SecurityError: localStorage is not available for opaque origins
  // https://github.com/jsdom/jsdom/issues/2304
  url: 'http://localhost',
  virtualConsole
});
const {window} = dom;
mockCanvas(window);

// // issue: https://github.com/chromaui/chromatic-cli/issues/14
Object.defineProperty(window, 'fetch', {
  value: () =>
    new Promise((res, rej) => {
      // we just let this never resolve
    }),
  writable: true
});

Object.defineProperty(window, 'prompt', {
  value: () => {},
  writable: true
});

function mockClipboardData() {
  let data = null;
  const obj = {};
  obj.data = () => {
    return data;
  };

  obj.setData = (format, text) => {
    data = {format, text};
  };
  obj.clearData = () => {};

  return obj;
}

Object.defineProperty(window, 'clipboardData', {
  value: mockClipboardData(),
  writable: true
});

// These do not seem to be present under jsdom v16, even though the documentation suggests that should be the case
['addEventListener', 'removeEventListener', 'dispatchEvent'].forEach(prop => {
  window[prop] = () => {};
});

const nop = () => {};

function mockCanvas(globalWindow) {
  globalWindow.HTMLCanvasElement.prototype.getContext = function mockGetContext() {
    return {
      fillRect: nop,
      clearRect: nop,
      getImageData: (x, y, w, h) => ({
        data: new Array(w * h * 4)
      }),
      putImageData: nop,
      createImageData: () => [],
      setTransform: nop,
      drawImage: nop,
      save: nop,
      fillText: nop,
      restore: nop,
      beginPath: nop,
      moveTo: nop,
      lineTo: nop,
      closePath: nop,
      stroke: nop,
      translate: nop,
      scale: nop,
      rotate: nop,
      arc: nop,
      fill: nop,
      measureText: () => ({width: 0}),
      transform: nop,
      rect: nop,
      clip: nop
    };
  };

  globalWindow.HTMLCanvasElement.prototype.toDataURL = () => '';
}

global.window = window;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.fetch = window.fetch;

Object.keys(global.window).forEach(property => {
  if (typeof global[property] === 'undefined') {
    global[property] = global.window[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
  platform: 'mac',
  appName: 'kepler.gl'
};

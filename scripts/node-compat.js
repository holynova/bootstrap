const Module = require('node:module');
const path = require('node:path');

const originalResolveFilename = Module._resolveFilename;
const streamTransformShim = path.join(__dirname, 'stream-transform.js');

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request === '_stream_transform') {
    return streamTransformShim;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

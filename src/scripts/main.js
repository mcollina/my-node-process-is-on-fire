// Require Node modules in the browser thanks to Browserify: http://browserify.org
var bespoke = require('bespoke'),
  classes = require('bespoke-classes'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
  bullets = require('bespoke-bullets'),
  backdrop = require('bespoke-backdrop'),
  scale = require('bespoke-scale'),
  hash = require('bespoke-hash'),
  progress = require('bespoke-progress'),
  multimedia = require('bespoke-multimedia'),
  run = require('bespoke-run'),
  extern = require('bespoke-extern');

// Bespoke.js
bespoke.from('article', [
  classes(),
  keys(),
  touch(),
  run(),
  bullets('li, .bullet'),
  backdrop(),
  scale(),
  hash(),
  progress(),
  multimedia(),
  extern()
]);

// Prism syntax highlighting
require('prismjs');
require('@fortawesome/fontawesome');

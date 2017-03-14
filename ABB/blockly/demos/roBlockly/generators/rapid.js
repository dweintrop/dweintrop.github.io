/**
 * @fileoverview Helper functions for generating RAPID for blocks.
 */
'use strict';

goog.provide('Blockly.Rapid');
goog.require('Blockly.Generator');

/**
 * RAPID code generator
 * @type {!Blockly.Generator}
 */
Blockly.Rapid = new Blockly.Generator('Rapid');

Blockly.Rapid.addReservedWords(
  //TODO
);

// TODO: add order of operation ENUMs

// TODO: add order overrides, if any

Blockly.Rapid.init = function(workspace) {

}

Blockly.Rapid.finish = function(code) {
  //TODO: implement properly
  return code;
}

Blockly.Rapid.scrub_ = function(block, code) {
  //TODO: implement properly
  return code;
}

Blockly.Rapid.scrubNakedValue = function(line) {
  //TODO: implement properly
  return line;
}

/**
 * @fileoverview Generating RAPID for RobotArm blocks.
 */
'use strict';

goog.provide('Blockly.Rapid.robotArm');
goog.require('Blockly.Rapid');

Blockly.Rapid['move_to_location'] = function(block) {
  var move_type = block.getFieldValue('move_type');
  var target = block.getFieldValue('dest');
  var code = move_type + ' ' + target + ',v100,z10,w_obj0;';
  //var code = 'moveL Target_10,v100,z10,w_obj0;';
  return code;
};

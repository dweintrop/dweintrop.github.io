/**
 * @fileoverview Generating RAPID for RobotArm blocks.
 */
'use strict';

goog.provide('Blockly.Rapid.robotArm');
goog.require('Blockly.Rapid');

Blockly.Rapid['move_to_location'] = function(block) {
  var move_type = block.getFieldValue('move_type');
  var inst = "MoveL";
  var speed = "v100";
  switch (move_type) {
    case "direct":
      inst = "MoveL";
      speed = "v100";
      break;

    case "quick":
      inst = "MoveJ";
      speed = "v500";
  
    case "circular":
      //TODO: figure out
      break;

    case "smooth":
      inst = "MoveL";
      speed = "v50";
      break;

    default:
      break;
  }
  var target = block.getFieldValue('dest');
  var tool = Blockly.Rapid.toolName;
  var wobj = Blockly.Rapid.wobjName;
  var code = inst + ' ' + target + ', ' + speed + ', fine, ' + tool + ', \\WObj:=' + wobj + ';';
  // var code = `${move_type} ${target}, v100, fine, ${tool}, \\WObj:=w_obj0;`;
  return code;
};

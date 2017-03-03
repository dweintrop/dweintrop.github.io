'use strict';


// only include if move into the main blocks directory
// goog.provide('Blockly.Blocks.robotArm');
// goog.require('Blockly.Blocks');


Blockly.Blocks['move_to_location'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move")
        .appendField(new Blockly.FieldDropdown([["directly","direct"], 
                                                ["quickly","quick"], 
                                                ["circularly", "circular"], 
                                                ["smoothly","smooth"]]), "move_type")
        .appendField("to")
        .appendField(new Blockly.FieldLocation("home"), "dest");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('');
  }, 
  onchange: function(changeEvent) {
    if (Blockly.getMainWorkspace().locationIndexOf(this.inputList[0].fieldRow[3].getValue()) == -1) {
      this.setWarningText('Location not yet configured.');
    }
  }
};

Blockly.Blocks['move_to_xyz'] = {
  init: function() {
    this.jsonInit({
      "message0": "Move %1 to x:%2 y: %3 z: %4",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "move_type",
          "options":
            [["directly","direct"], 
              ["quickly","quick"], 
              ["circularly", "circular"], 
              ["smoothly","smooth"]]
        },
        {
          "type": "input_value",
          "name": "x",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "y",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "z",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "colour": 60,
      "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL,
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};

// Blockly.Blocks['config_location'] = {
//   init: function() {
//     this.appendDummyInput().appendField("Configure")
//         .appendField(new Blockly.FieldLocation("home"), "dest");
//     this.setColour(60);
//     this.setTooltip('');
//     this.setHelpUrl('');
//     this.setMutator(new Blockly.Mutator(['']));
//   },
  
//   /**
//    * Populate the mutator's dialog with this block's components.
//    */
//   decompose: function(workspace) {
//     var configBlock = workspace.newBlock('config_location');
//     configBlock.initSvg();
//     var nameInp = workspace.newBlock('text');
//     nameInp.initSvg();
//     nameInp.getField("TEXT").setValue("New Location");
//     configBlock.getInput("locale_name").connection.connect(nameInp.outputConnection);
//     var xInp = workspace.newBlock('math_number');
//     xInp.initSvg();
//     xInp.getField("NUM").setValue(180);
//     configBlock.getInput("x").connection.connect(xInp.outputConnection);
//     var yInp = workspace.newBlock('math_number');
//     yInp.getField("NUM").setValue(180);
//     yInp.initSvg();
//     configBlock.getInput("y").connection.connect(yInp.outputConnection);
//     var zInp = workspace.newBlock('math_number');
//     zInp.getField("NUM").setValue(180);
//     zInp.initSvg();
//     configBlock.getInput("z").connection.connect(zInp.outputConnection);
//     return configBlock;
//   },
//   compose: function(containerBlock) {
//   },
//   mutationToDom: function(workspace) {
//     var container = document.createElement('mutation');
//     container.setAttribute('x', this.getFieldValue('x'));
//     return container;
//   },
//   domToMutation: function(container) {
//     this.x = container.getAttribute('x');
//   }
// };

Blockly.Blocks['configure_location'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Configure Location: ")
        .appendField(new Blockly.FieldLocation("home"), "locale");
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setMutator(new Blockly.Mutator(['']));
  },
  /**
   * Populate the mutator's dialog with this block's components.
   */
  decompose: function(workspace) {
    var configBlock = workspace.newBlock('location_details');
    configBlock.initSvg();
    var nameInp = workspace.newBlock('text');
    nameInp.initSvg();
    var incomingLocName = this.getFieldValue("locale");
    nameInp.getField("TEXT").setValue(incomingLocName);
    configBlock.getInput("locale_name").connection.connect(nameInp.outputConnection);

    var locs = workspace.locationList.filter(function(obj){return obj.name === incomingLocName;});
    var x = 100, y = 150, z = 200;
    if (locs.length == 1) {
      x = locs[0].x; y = locs[0].y; z = locs[0].z;
    }

    var xInp = workspace.newBlock('math_number');
    xInp.initSvg();
    xInp.getField("NUM").setValue(x);
    configBlock.getInput("x").connection.connect(xInp.outputConnection);
    var yInp = workspace.newBlock('math_number');
    yInp.getField("NUM").setValue(y);
    yInp.initSvg();
    configBlock.getInput("y").connection.connect(yInp.outputConnection);
    var zInp = workspace.newBlock('math_number');
    zInp.getField("NUM").setValue(z);
    zInp.initSvg();
    configBlock.getInput("z").connection.connect(zInp.outputConnection);
    return configBlock;
  }, 
  compose: function(containerBlock) {
    var name = containerBlock.getChildren()[0].getFieldValue("TEXT");
    var x = containerBlock.getChildren()[1].getFieldValue("NUM");
    var y = containerBlock.getChildren()[2].getFieldValue("NUM");
    var z = containerBlock.getChildren()[3].getFieldValue("NUM");
    Blockly.getMainWorkspace().renameLocation(this.getFieldValue("locale"), name, x, y, z);
  },
  mutationToDom: function(workspace) {
    var container = document.createElement('mutation');
    var xInput = (this.getFieldValue('x') == this.getInput('x'));
    container.setAttribute('x', xInput);
    return container;
    
  },
  domToMutation: function(container) {
    this.x = container.getAttribute('x');
  }
};

Blockly.Blocks['change_arm_by'] = {
  init: function() {
    this.jsonInit({
      "type": "change_arm",
      "message0": "Change %1 by %2 %3",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "axis",
          "options": [
            [
              "x",
              "x"
            ],
            [
              "y",
              "y"
            ],
            [
              "z",
              "z"
            ]
          ]
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "dist",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "colour": 60,
      "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL,
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};

////////////////////////////
//     Old blocks/ideas   //
////////////////////////////

// Blockly.Blocks['move_to_location'] = {
//   init: function() {
//     this.appendDummyInput()
//         .appendField("Move to Location");
//     this.setPreviousStatement(true, null);
//     this.setNextStatement(true, null);
//     this.setColour(60);
//     this.setTooltip('');
//     this.setHelpUrl('');
//     this.setMutator(new Blockly.Mutator(['']));
//     this.x = 1;
//     this.y = 2;
//     this.z = 3;
//   },

//    /**
//    * Populate the mutator's dialog with this block's components.
//    */
//   decompose: function(workspace) {
//     var configBlock = workspace.newBlock('config_move');
//     configBlock.initSvg();
//     return configBlock;
//   },
//   compose: function(containerBlock) {
//   },
//   mutationToDom: function(workspace) {
//     var container = document.createElement('mutation');
//     container.setAttribute('x', this.getFieldValue('x'));
//     return container;
//   },
//   domToMutation: function(container) {
//     this.x = container.getAttribute('x');
//   }

// };

// Blockly.Blocks['config_move'] = {
//   init: function() {
//     this.appendDummyInput()
//         .appendField("Configure Move");
//     this.appendDummyInput()
//         .setAlign(Blockly.ALIGN_RIGHT)
//         .appendField("X:")
//         .appendField(new Blockly.FieldNumber(180, -360, 360, 0.01), "x");
//     this.appendDummyInput()
//         .setAlign(Blockly.ALIGN_RIGHT)
//         .appendField("Y:")
//         .appendField(new Blockly.FieldNumber(180, -360, 360, 0.01), "y");
//     this.appendDummyInput()
//         .setAlign(Blockly.ALIGN_RIGHT)
//         .appendField("Z:")
//         .appendField(new Blockly.FieldNumber(180, -360, 360, 0.01), "z");
//     this.appendDummyInput()
//         .appendField("Move Type")
//         .appendField(new Blockly.FieldDropdown([["Direct","Direct"], ["Fast","Fast"], ["Smooth","Smooth"]]), "type");
//     this.setInputsInline(false);
//     this.setColour(180);
//     this.setTooltip('');
//     this.setHelpUrl('');
//   }
// };


// Blockly.Blocks['go_home'] = {
//   init: function() {
//     this.appendDummyInput()
//         .appendField("Move to")
//         .appendField(new Blockly.FieldVariable("home"), "loc_name");
//     this.setPreviousStatement(true, null);
//     this.setNextStatement(true, null);
//     this.setColour(60);
//     this.setTooltip('');
//     this.setHelpUrl('');
//   }
// };
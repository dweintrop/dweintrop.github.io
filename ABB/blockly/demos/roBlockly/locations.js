
/**
 * @fileoverview Utility functions for handling variables.
 */
'use strict';

goog.provide('Blockly.Locations');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Category to separate location names from procedures and generated functions.
 */
Blockly.Locations.NAME_TYPE = 'LOCATION';

Blockly.Location = function(name, x, y, z) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.z = z;
};

Blockly.Blocks['locations_config'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl();
    this.setColour(60);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLocation(
        "location"), 'LOC');
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
    this.contextMenuMsg_ = "Create 'set %1'";
    this.setMutator(new Blockly.Mutator(['']));
  },
  // contextMenuType_: 'locations_set',
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    var name = this.getFieldValue('LOC');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'LOC');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  },
  decompose: function(workspace) {
    var configBlock = workspace.newBlock('location_details');
    configBlock.initSvg();
    var nameInp = workspace.newBlock('text');
    nameInp.initSvg();
    var incomingLocName = this.getFieldValue("LOC");
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
    Blockly.getMainWorkspace().renameLocation(this.getFieldValue("LOC"), name, x, y, z);
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

Blockly.Blocks['location_details'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Define Location");
    this.appendValueInput("locale_name")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Name:");
    this.appendValueInput("x")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("X:");
    this.appendValueInput("y")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Y:");
    this.appendValueInput("z")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Z:");
    this.setColour(180);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

/**
 * Find all user-created locations that are in use in the workspace.
 * For use by generators.
 * @param {!Blockly.Block|!Blockly.Workspace} root Root block or workspace.
 * @return {!Array.<string>} Array of locations names.
 */
Blockly.Locations.allUsedLocations = function(root) {
  var locations;
  if (root instanceof Blockly.Block) {
    // Root is Block.
    locations = root.getDescendants();
  } else if (root.getAlllocations) {
    // Root is Workspace.
    locations = root.getAllLocations();
  } else {
    throw 'Not Block or Workspace: ' + root;
  }
  var locationHash = Object.create(null);
  // Iterate through every block and add each location to the hash.
  for (var x = 0; x < locations.length; x++) {
    var blockLocations = locations[x].getLocations();
    if (blockLocations) {
      for (var y = 0; y < blockLocations.length; y++) {
        var locName = blockLocations[y];
        // Location name may be null if the block is only half-built.
        if (locName) {
          locationHash[locName.toLowerCase()] = locName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var locationList = [];
  for (var name in locationHash) {
    locationList.push(locationHash[name]);
  }
  return locationList;
};

/**
 * Find all locations that the user has created through the workspace or
 * toolbox.  For use by generators.
 * @param {!Blockly.Workspace} root The workspace to inspect.
 * @return {!Array.<string>} Array of locations names.
 */
Blockly.Locations.allLocations = function(root) {
  if (root instanceof Blockly.Block) {
    // Root is Block.
    console.warn('Deprecated call to Blockly.Locations.allLocations ' +
                 'with a block instead of a workspace.  You may want ' +
                 'Blockly.Locations.allUsedVariables');
  }
  return root.locationList;
};

/**
 * Construct the blocks required by the flyout for the location category.
 * @param {!Blockly.Workspace} workspace The workspace contianing location.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Locations.flyoutCategory = function(workspace) {
  var locationList = workspace.locationList;
  locationList.sort(goog.string.caseInsensitiveCompare);

  var xmlList = [];

  /////////////////////////
  // add robot arm blocks
  /////////////////////////

  var block = goog.dom.createDom('block');
  block.setAttribute('type', 'move_to_location');
  block.setAttribute('gap', 16);
  xmlList.push(block);

        // <block type="change_arm_by">
        //   <value name="dist">
        //     <shadow type="math_number">
        //       <field name="NUM">100</field>
        //     </shadow>
        //   </value>
        // </block>

  var change_arm_by = goog.dom.createDom('block');
  change_arm_by.setAttribute('type', 'change_arm_by');
  change_arm_by.setAttribute('gap', 16);

  var value = goog.dom.createDom('value');
  value.setAttribute('name', 'dist');
  var shadow = goog.dom.createDom('shadow');
  shadow.setAttribute('type', 'math_number');
  var numInp = goog.dom.createDom('field');
  numInp.setAttribute('name', 'NUM');
  numInp.innerHTML = '100';
  shadow.appendChild(numInp);
  value.appendChild(shadow)
  change_arm_by.appendChild(value);
  xmlList.push(change_arm_by);


  /////////////////////////
  // add Location buttons/names
  /////////////////////////

  var button = goog.dom.createDom('button');
  button.setAttribute('text', 'Create New Location');
  button.setAttribute('callbackKey', 'CREATE_LOCATION');
  button.setAttribute('gap', 10);
  workspace.registerButtonCallback('CREATE_LOCATION', function(button) {
    Blockly.Locations.createLocation(button.getTargetWorkspace());
  });

  xmlList.push(button);

  // Hide configure location button as we are going to try and make labels into links
  // var configButton = goog.dom.createDom('button');
  // configButton.setAttribute('text', 'Configure Location:');
  // configButton.setAttribute('gap', 16);
  // configButton.setAttribute('callbackKey', 'CONFIGURE_LOCATION');
  // workspace.registerButtonCallback('CONFIGURE_LOCATION', function(button) {
  //   alert('Put RobotStudio hook here');
  // });
  // xmlList.push(configButton);


  var dropdown = goog.dom.createDom('dropdown');
  xmlList.push(dropdown);

  if (locationList.length > 0) {
    // if (Blockly.Blocks['location_set']) {
    //   // <block type="variables_set" gap="20">
    //   //   <field name="VAR">item</field>
    //   // </block>
    //   var block = goog.dom.createDom('block');
    //   block.setAttribute('type', 'location_set');
    //   if (Blockly.Blocks['math_change']) {
    //     block.setAttribute('gap', 8);
    //   } else {
    //     block.setAttribute('gap', 24);
    //   }
    //   var field = goog.dom.createDom('field', null, locationList[1]);
    //   field.setAttribute('name', 'LOC');
    //   block.appendChild(field);
    //   xmlList.push(block);
    // }


    if (!locationList.empty) {
      var locationLabel = goog.dom.createDom('label');
      locationLabel.setAttribute('text', 'Defined Locations:');
      locationLabel.setAttribute('web-class', 'locations-title');
      locationLabel.setAttribute('gap', 4);
      xmlList.push(locationLabel);
    }

    for (var i = 0; i < locationList.length; i++) {
      var locationName = goog.dom.createDom('label');
      locationName.setAttribute('text', '    ' + locationList[i].name);
      locationName.setAttribute('web-class', 'locations-list');
      locationName.setAttribute('indent', 'true');
      locationName.setAttribute('editPalette', 'true');
      locationName.setAttribute('gap', 4);
      xmlList.push(locationName);
      // The below code adds each location as a block (a la variables) 
      //
      // var block = goog.dom.createDom('block');
      // block.setAttribute('type', 'locations_config');
      // if (Blockly.Blocks['locations_set']) {
      //   block.setAttribute('gap', 4);
      // }
      // var field = goog.dom.createDom('field', null, locationList[i].name);
      // field.setAttribute('name', 'LOC');
      // block.appendChild(field);
      // xmlList.push(block);
    }
  }
  return xmlList;
};

/**
* Return a new location name that is not yet being used. This will try to
* generate single letter location names in the range 'i' to 'z' to start with.
* If no unique name is located it will try 'i' to 'z', 'a' to 'h',
* then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
* @return {string} New location name.
*/
Blockly.Locations.generateUniqueName = function(workspace) {
  var locationList = workspace.locationList;
  var newName = '';
  if (locationList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < locationList.length; i++) {
        if (locationList[i].toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
          break;
        }
      }
      if (inUse) {
        // Try the next potential name.
        letterIndex++;
        if (letterIndex == letters.length) {
          // Reached the end of the character sequence so back to 'i'.
          // a new suffix.
          letterIndex = 0;
          nameSuffix++;
        }
        potName = letters.charAt(letterIndex);
        if (nameSuffix > 1) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

/**
 * Create a new location on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     location.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new location name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing location was chosen.
 */
Blockly.Locations.createLocation = function(workspace, opt_callback) {
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Locations.promptName("New location name:", defaultName,
      function(text) {
        if (text) {
          if (workspace.locationIndexOf(text) != -1) {
            Blockly.alert("A location named '%1' already exists.".replace('%1',
                text.toLowerCase()),
                function() {
                  promptAndCheckWithAlert(text);  // Recurse
                });
          } else {
            workspace.createLocation(text);
            if (opt_callback) {
              opt_callback(text);
            }
          }
        } else {
          // User canceled prompt without a value.
          if (opt_callback) {
            opt_callback(null);
          }
        }
      });
  };
  promptAndCheckWithAlert('');

  alert('Put RobotStudio hook here');

};

/**
 * Prompt the user for a new location name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @param {function(?string)} callback A callback. It will return the new
 *     location name, or null if the user picked something illegal.
 */
Blockly.Locations.promptName = function(promptText, defaultText, callback) {
  Blockly.prompt(promptText, defaultText, function(newLoc) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newLoc) {
      newLoc = newLoc.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (newLoc == "Rename location..." ||
          newLoc == "New location name:") {
        // Ok, not ALL names are legal...
        newLoc = null;
      }
    }
    callback(newLoc);
  });
};
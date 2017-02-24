
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
  if (Blockly.Blocks['math_change']) {
    block.setAttribute('gap', 8);
  } else {
    block.setAttribute('gap', 24);
  }
  xmlList.push(block);

  var block = goog.dom.createDom('block');
  block.setAttribute('type', 'configure_location');
  if (Blockly.Blocks['math_change']) {
    block.setAttribute('gap', 8);
  } else {
    block.setAttribute('gap', 24);
  }
  xmlList.push(block);

  var button = goog.dom.createDom('button');
  button.setAttribute('text', 'Create Location...');
  button.setAttribute('callbackKey', 'CREATE_LOCATION');

  workspace.registerButtonCallback('CREATE_LOCATION', function(button) {
    Blockly.Locations.createLocation(button.getTargetWorkspace());
  });

  xmlList.push(button);

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

    for (var i = 0; i < locationList.length; i++) {
      if (Blockly.Blocks['locations_config']) {
        // <block type="variables_get" gap="8">
        //   <field name="VAR">item</field>
        // </block>
        var block = goog.dom.createDom('block');
        block.setAttribute('type', 'locations_config');
        if (Blockly.Blocks['locations_set']) {
          block.setAttribute('gap', 8);
        }
        var field = goog.dom.createDom('field', null, locationList[i].name);
        field.setAttribute('name', 'LOC');
        block.appendChild(field);
        xmlList.push(block);
      }
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
/**
 * @fileoverview Location input field.
 */
'use strict';

goog.provide('Blockly.LocationVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Locations');
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Class for a location's dropdown field.
 * @param {?string} locname The default name for the location.  If null,
 *     a unique location name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldLocation = function(locname, opt_validator) {
  Blockly.FieldLocation.superClass_.constructor.call(this,
      Blockly.FieldLocation.dropdownCreate, opt_validator);
  this.setValue(locname || '');
};
goog.inherits(Blockly.FieldLocation, Blockly.FieldDropdown);

/**
 * The menu item index for the rename location option.
 * @type {number}
 */
Blockly.FieldLocation.prototype.renameLocItemIndex_ = -1;
/**
 * The menu item index for the configure location option.
 * @type {number}
 */
Blockly.FieldLocation.prototype.configureLocItemIndex_ = -1;

/**
 * The menu item index for the delete location option.
 * @type {number}
 */
Blockly.FieldLocation.prototype.deleteLocItemIndex_ = -1;


/**
 * Install this dropdown on a block.
 */
Blockly.FieldLocation.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldLocation.superClass_.init.call(this);
  if (!this.getValue()) {
    // Location without names get uniquely named for this workspace.
    var workspace =
        this.sourceBlock_.isInFlyout ?
            this.sourceBlock_.workspace.targetWorkspace :
            this.sourceBlock_.workspace;
    this.setValue(Blockly.Locations.generateUniqueName(workspace));
  }


  // // If the selected location doesn't exist yet, create it.
  // // For instance, some blocks in the toolbox have location dropdowns filled
  // // in by default.
  // if (!this.sourceBlock_.isInFlyout) {
  //   this.sourceBlock_.workspace.createLocation(this.getValue());
  // }

};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldLocation.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Location fields are not allowed to exist on shadow blocks.');
  Blockly.FieldLocation.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the location's name.
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldLocation.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the location name.
 * @param {string} newValue New text.
 */
Blockly.FieldLocation.prototype.setValue = function(newValue) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  this.setText(newValue);
};

/**
 * Return a sorted list of location names for location dropdown menus.
 * Include a special option at the end for creating a new location name.
 * @return {!Array.<string>} Array of location names.
 * @this {!Blockly.FieldLocation}
 */
Blockly.FieldLocation.dropdownCreate = function() {
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    // Get a copy of the list, so that adding rename and new location options
    // doesn't modify the workspace's list.
    var locationList = []; //this.sourceBlock_.workspace.locationList.slice(0);
    for (var i = 0; i < this.sourceBlock_.workspace.locationList.length; i++) {
      locationList.push(this.sourceBlock_.workspace.locationList[i].name);
    }
  } else {
    var locationList = [];
  }
 
  // // Ensure that the currently selected location is an option.
  // var name = this.getText();
  // if (name && locationList.indexOf(name) == -1) {
  //   locationList.push(name);
  // }
  // locationList.sort(goog.string.caseInsensitiveCompare);

  this.renameLocItemIndex_ = locationList.length;
  locationList.push("Rename location");

  this.configureLocItemIndex_ = locationList.length;
  locationList.push("Configure location");

  this.deleteLocItemIndex_ = locationList.length;
  locationList.push("Delete the '%1' location".replace('%1', this.getText()));
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var i = 0; i < locationList.length; i++) {
    options[i] = [locationList[i], locationList[i]];
  }
  return options;
};

/**
 * Handle the selection of an item in the location dropdown menu.
 * Special case the 'Rename location...' and 'Delete location...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldLocation.prototype.onItemSelected = function(menu, menuItem) {
  var menuLength = menu.getChildCount();
  var itemText = menuItem.getValue();
  if (this.sourceBlock_) {
    var workspace = this.sourceBlock_.workspace;
    if (this.renameLocItemIndex_ >= 0 &&
        menu.getChildAt(this.renameLocItemIndex_) === menuItem) {
      // Rename location.
      var oldName = this.getText();
      Blockly.hideChaff();
      Blockly.Locations.Rename(oldName);
      return;
    }  else if (this.configureLocItemIndex_ >=0 &&
        menu.getChildAt(this.configureLocItemIndex_) === menuItem) {
        alert('Put RobotStudio hook here');
        
        //if location is new - register it
        if (workspace.locationIndexOf(this.getText() == -1) ) {
          // register new location & remove warning
          workspace.createLocation(this.getText());
          if (this.sourceBlock_.warning){
            this.sourceBlock_.warning.dispose();
            this.sourceBlock_.render();
          }
        }
        return;
    } else if (this.deleteLocItemIndex_ >= 0 &&
        menu.getChildAt(this.deleteLocItemIndex_) === menuItem) {
      // Delete location.
      workspace.deleteLocation(this.getText());
      return;
    }
    // Call any validation function, and allow it to override.
    itemText = this.callValidator(itemText);
    if (this.sourceBlock_.warning){
      this.sourceBlock_.warning.dispose();
      this.sourceBlock_.render();
    }
  }
  if (itemText !== null) {
    this.setValue(itemText);
  }
};

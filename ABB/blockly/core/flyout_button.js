/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a button in the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {!Element} xml The XML specifying the label/button.
 * @param {boolean} isLabel Whether this button should be styled as a label.
 * @constructor
 */
Blockly.FlyoutButton = function(workspace, targetWorkspace, xml, isLabel) {
  // Labels behave the same as buttons, but are styled differently.

  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  /**
   * @type {string}
   * @private
   */
  this.text_ = xml.getAttribute('text');

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);

  /**
   * Whether this button should be styled as a label.
   * @type {boolean}
   * @private
   */
  this.isLabel_ = isLabel;

  /**
   * Function to call when this button is clicked.
   * @type {function(!Blockly.FlyoutButton)}
   * @private
   */
  this.callback_ = null;

  var callbackKey = xml.getAttribute('callbackKey');
  if (this.isLabel_ && callbackKey) {
    console.warn('Labels should not have callbacks. Label text: ' + this.text_);
  } else if (!this.isLabel_ &&
      !(callbackKey && targetWorkspace.getButtonCallback(callbackKey))) {
    console.warn('Buttons should have callbacks. Button text: ' + this.text_);
  } else {
    this.callback_ = targetWorkspace.getButtonCallback(callbackKey);
  }

  /**
   * If specified, a CSS class to add to this button.
   * @type {?string}
   * @private
   */
  this.cssClass_ = xml.getAttribute('web-class') || null;

  /**
   * If specified, the button/label is indented.
   * @type {?string}
   * @private
   */
  this.indent_ = xml.getAttribute('indent') || false;

  /**
   * Whether on not this button should display the gear, pencil, and red x
   * @type {boolean}
   * @private
   */
  this.hasEditPalette_= xml.getAttribute('editPalette') || false;
};

/**
 * The margin around the text in the button.
 */
Blockly.FlyoutButton.MARGIN = 5;

/**
 * The width of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.width = 0;

/**
 * The height of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.height = 0;

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutButton.prototype.createDom = function() {
  var cssClass = this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton';
  if (this.cssClass_) {
    cssClass += ' ' + this.cssClass_;
  }

  this.svgGroup_ = Blockly.utils.createSvgElement('g', {'class': cssClass},
      this.workspace_.getCanvas());

  if (!this.isLabel_) {
    // Shadow rectangle (light source does not mirror in RTL).
    var shadow = Blockly.utils.createSvgElement('rect',
        {'class': 'blocklyFlyoutButtonShadow',
         'rx': 4, 'ry': 4, 'x': 1, 'y': 1},
         this.svgGroup_);
  }
  // Background rectangle.
  var rect = Blockly.utils.createSvgElement('rect',
      {'class': this.isLabel_ ?
        'blocklyFlyoutLabelBackground' : 'blocklyFlyoutButtonBackground',
        'rx': 4, 'ry': 4},
      this.svgGroup_);

  var svgText = Blockly.utils.createSvgElement('text',
      {'class': this.isLabel_ ? 'blocklyFlyoutLabelText' : 'blocklyText',
          'x': 0, 'y': 0, 'text-anchor': 'middle'},
      this.svgGroup_);
  svgText.textContent = this.text_;

  this.width = svgText.getComputedTextLength() +
      2 * Blockly.FlyoutButton.MARGIN;
  this.height = 20;  // Can't compute it :(

  if (!this.isLabel_) {
    shadow.setAttribute('width', this.width);
    shadow.setAttribute('height', this.height);
  } else {
    
    // kind of clunky way to render edit Palette
    if (this.hasEditPalette_) {

      var gear = Blockly.utils.createSvgElement('g', {}, this.svgGroup_);
      // Square with rounded corners.
      Blockly.utils.createSvgElement('rect',
          {'class': 'blocklyIconShape',
           'rx': '4', 'ry': '4',
           'height': '16', 'width': '16',
            'x': this.width},
           gear);
      // Gear teeth.
      Blockly.utils.createSvgElement('path',
          {'class': 'blocklyIconSymbol',
           'd': 'm' + (4.203 + this.width) + ',7.296 0,1.368 -0.92,0.677 -0.11,0.41 0.9,1.559 0.41,0.11 1.043,-0.457 1.187,0.683 0.127,1.134 0.3,0.3 1.8,0 0.3,-0.299 0.127,-1.138 1.185,-0.682 1.046,0.458 0.409,-0.11 0.9,-1.559 -0.11,-0.41 -0.92,-0.677 0,-1.366 0.92,-0.677 0.11,-0.41 -0.9,-1.559 -0.409,-0.109 -1.046,0.458 -1.185,-0.682 -0.127,-1.138 -0.3,-0.299 -1.8,0 -0.3,0.3 -0.126,1.135 -1.187,0.682 -1.043,-0.457 -0.41,0.11 -0.899,1.559 0.108,0.409z'},
           gear);
      // Axle hole.
      Blockly.utils.createSvgElement('circle',
          {'class': 'blocklyIconShape', 'r': '2.7', 'cx': this.width + 8, 'cy': '8',
            'x': this.width},
           gear);
      gear.setAttribute('style', 'cursor:pointer;');
      gear.setAttribute('onclick', 'window.external.ReDefineTarget("'+svgText.textContent+'");');
      var gearTitle = Blockly.utils.createSvgElement('title', {}, gear);
      gearTitle.innerHTML = 'Configure Location';

      var pencil = Blockly.utils.createSvgElement('g', {}, this.svgGroup_);
      // Square with rounded corners.
      // Blockly.utils.createSvgElement('rect',
      //     {'class': 'blocklyIconShape',
      //      'rx': '4', 'ry': '4',
      //      'height': '16', 'width': '16',
      //       'x': this.width + 20},
      //      pencil);
      // Blockly.utils.createSvgElement('path',
      //     {'class': 'blocklyIconSymbol',
      //       'style':'transform:scale(.6)',
      //      'd': 'm' + (18.363 + this.width + 70) +' 8.464l1.433 1.431-12.67 12.669-7.125 1.436 1.439-7.127 12.665-12.668 1.431 1.431-12.255 12.224-.726 3.584 3.584-.723 12.224-12.257zm-.056-8.464l-2.815 2.817 5.691 5.692 2.817-2.821-5.693-5.688zm-12.318 18.718l11.313-11.316-.705-.707-11.313 11.314.705.709z'},
      //      pencil);
      Blockly.utils.createSvgElement('image',
        {'href':'pencil2.png',
        'height':'16', 'width':'16', 'x':this.width + 20},
        pencil)
      pencil.setAttribute('height', '16');
      pencil.setAttribute('width', '16');
      pencil.setAttribute('style', 'cursor:pointer;');
      pencil.setAttribute('onclick', 'Blockly.Locations.Rename("'+this.text_.trim()+'")');
      var pencilTitle = Blockly.utils.createSvgElement('title', {}, pencil);
      pencilTitle.innerHTML = 'Rename Location';


      var garbage = Blockly.utils.createSvgElement('g', {}, this.svgGroup_);
      // Square with rounded corners.
      // Blockly.utils.createSvgElement('rect',
      //     {'class': 'blocklyIconShape',
      //      'rx': '4', 'ry': '4',
      //      'height': '16', 'width': '16',
      //       'x': this.width + 40},
      //      garbage);
      Blockly.utils.createSvgElement('image',
        {'href':'red_x.png',
        'height':'14', 'width':'14', 'x':this.width + 38, 'y': 1},
        garbage)
      garbage.setAttribute('height', '16');
      garbage.setAttribute('width', '16');
      garbage.setAttribute('style', 'cursor:pointer;');
      garbage.setAttribute('onclick', 'Blockly.mainWorkspace.deleteLocation("'+this.text_.trim()+'");Blockly.mainWorkspace.toolbox_.refreshSelection();');
      var garbageTitle = Blockly.utils.createSvgElement('title', {}, garbage);
      garbageTitle.innerHTML = 'Delete Location';
    }
  }
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);

  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height - Blockly.FlyoutButton.MARGIN);

  this.updateTransform_();
  return this.svgGroup_;
};

/**
 * Correctly position the flyout button and make it visible.
 */
Blockly.FlyoutButton.prototype.show = function() {
  this.updateTransform_();
  this.svgGroup_.setAttribute('display', 'block');
};

/**
 * Update svg attributes to match internal state.
 * @private
 */
Blockly.FlyoutButton.prototype.updateTransform_ = function() {
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.position_.x + ',' + this.position_.y + ')');
};

/**
 * Move the button to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
Blockly.FlyoutButton.prototype.moveTo = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;
  this.updateTransform_();
};

/**
 * Get the button's target workspace.
 * @return {!Blockly.WorkspaceSvg} The target workspace of the flyout where this
 *     button resides.
 */
Blockly.FlyoutButton.prototype.getTargetWorkspace = function() {
  return this.targetWorkspace_;
};

/**
 * Dispose of this button.
 */
Blockly.FlyoutButton.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 */
Blockly.FlyoutButton.prototype.onMouseUp = function(e) {
  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
  // Stop binding to mouseup and mousemove events--flyout mouseup would normally
  // do this, but we're skipping that.
  Blockly.Flyout.terminateDrag_();

  // Call the callback registered to this button.
  if (this.callback_) {
    this.callback_(this);
  }
};

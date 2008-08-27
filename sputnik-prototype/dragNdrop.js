//	Copyright 2008 Alex Trujillo
//	Full source available here: http://code.google.com/p/vektornye/

//	LICENSE
//	This file is part of the Vektornye engine.
//	
//	Vektornye is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, either version 3 of the License, or
//	(at your option) any later version.
//	
//	Vektornye is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//	
//	You should have received a copy of the GNU General Public License
//	along with Vektornye.  If not, see <http://www.gnu.org/licenses/>.

//	SUMMARY
//	dragNdrop.js implements much of the functionality of the user interface. Here there is, of course,
//	drag & drop functionality, however, there is also snapping, stacking, and other UI-related features.
//	The basis for this code was the SVG-Whiz example, here: http://svg-whiz.com/svg/DragAndDrop.svg
//	This code is used as per this statement within the file: "Use or misuse this code however you wish."

var SVGDocument = null;
var SVGRoot = document.rootElement;
var svgNS = 'http://www.w3.org/2000/svg';

var TrueCoords = null;
var GrabPoint = null;
var BackDrop = null;
var DragTarget = null;

var grid_x = 16;
var grid_y = 16;

var initialized = false;

// Field is short for Playfield, and each element contains 5 values; X, Y, Z, color, and functionality.
var Field = new Object();
Field.length = 0;

Voxel = new Array();

// Creates values within an associative arrray of established coordinates
function VoxArray(voxel, x, y, z, value) {
	if (voxel[x] == null) {
		voxel[x] = new Array(x);
	}

	if (voxel[x][y] == null) {
		voxel[x][y] = new Array(y);
	}

	voxel[x][y][z] = value;
}

function transformGrid() {
	// Make the grid (x,y) by getting the width & height of the root SVG element
	gridTransform(grid_x, grid_y, window.innerWidth, window.innerHeight);
}

function Init(evt)
{
	var init0 = new Date(); 
	
	transformGrid();
	
	// Create a new block based on the template (hidden outside of the screen)
	//SVGRoot.appendChild(block(100, 100, 'random'));
	
	// these svg points hold x and y values...
	//    very handy, but they do not display on the screen (just so you know)
	TrueCoords = SVGRoot.createSVGPoint();
	GrabPoint = SVGRoot.createSVGPoint();
	
	// this will serve as the canvas over which items are dragged.
	//    having the drag events occur on the mousemove over a backdrop
	//    (instead of the dragged element) prevents the dragged element
	//    from being inadvertantly dropped when the mouse is moved rapidly
	BackDrop = document.getElementById('BackDrop');
	
	// Move RightButtons to the right
	rightbuttons = document.getElementById('RightButtons');
	rightbuttons.setAttributeNS(null, 'transform', 'translate(' + (window.innerWidth - 220) + ', 25)');
	// Populate the palette with colorful blocks
	populatePalette();
	
	// This is set onload, because if the user moves their mouse before the file is loaded, an error occurs
	SVGRoot.setAttributeNS(null, 'onmousemove', 'Drag(evt)');
	
//	onmousemove="Drag(evt)";
	
	var init1 = new Date(); 
	
	loggit('Program initialized in ' + (init1 - init0) + ' milliseconds.');
	initialized = true;
}

window.onresize = function() {
	if(initialized) {
		loggit('Resolution change detected-- please refresh your browser for best results.');
	}
}

function Grab(evt) {
	// find out which element we moused down on
	var targetElement = evt.target;
	// If the element has an ID, check to see if it's in the noFlyZone.
	if (targetElement.hasAttribute('id') == true) {
		var nFZ = targetElement.getAttribute('id').substr(0,3);
	} else {
		var nFZ = 'bla';
	}
	
	// See if the currently moused block is present in Field
	/*
	for (x = 0; x <= (Field.length - 1); x++) {
		targetElement.parentNode.id.substr(7, 10)
	}
	*/
	
	// This code should move only blocks.
	if (targetElement.parentNode.id.substr(0,5) == 'block' || targetElement.parentNode.id.substr(0,5) == 'inlay') {		
		//set the item moused down on as the element to be dragged
		if (targetElement.parentNode.id.substr(0,5) == 'inlay') {
			DragTarget = targetElement.parentNode.parentNode;
		} else {
			DragTarget = targetElement.parentNode;
		}
		// Grab parent attributes before DragTarget is attached to SVGRoot
		dragParent = DragTarget.parentNode.id;
		
		var dragParentCTM = new Object;
		
		dragParentCTM.e = 0;
		dragParentCTM.f = 0;
		
		if (dragParent.substr(0, 5) == 'block') {
			dragParentCTM = DragTarget.parentNode.getCTM();
			DragTarget.setAttributeNS(null, 'transform', 'translate(' + (dragParentCTM.e - 1) + ',' + (dragParentCTM.f - 34) + ')');
		}		
		
		// Attach to SVGRoot so it appears over everything else when dragged.
		SVGRoot.appendChild(DragTarget);
		
		// turn off all pointer events to the dragged element, this does 2 things:
		//    1) allows us to drag text elements without selecting the text
		//    2) allows us to find out where the dragged element is dropped (see Drop)
		DragTarget.setAttributeNS(null, 'pointer-events', 'none');
		
		replaceBlock = true;
		
		// we need to find the current position and translation of the grabbed element,
		//    so that we only apply the differential between the current location
		//    and the new location
		
		// Find the Current Transformation Matrix of the grabbed element, and, calculate the difference
		// between the current and new locations, in addition to the CTM of its parent (if available)
		var transMatrix = DragTarget.getCTM();
		GrabPoint.x = TrueCoords.x - (Number(transMatrix.e));
		GrabPoint.y = TrueCoords.y - (Number(transMatrix.f));
	}
};

function Drag(evt)
{
	// account for zooming and panning
	GetTrueCoords(evt);
	
	// if we don't currently have an element in tow, don't do anything
	if (DragTarget)
	{
		// account for the offset between the element's origin and the
		//    exact place we grabbed it... this way, the drag will look more natural
		var newX = TrueCoords.x - GrabPoint.x;
		var newY = TrueCoords.y - GrabPoint.y;
		
		// apply a new tranform translation to the dragged element, to display
		//    it in its new location
		DragTarget.setAttributeNS(null, 'transform', 'translate(' + newX + ',' + newY + ')');
	}
};

function Drop(evt)
{
	// if we aren't currently dragging an element, don't do anything
	if ( DragTarget )
	{
		// since the element currently being dragged has its pointer-events turned off,
		//    we are afforded the opportunity to find out the element it's being dropped on
		var targetElement = evt.target;
				
		//alert(targetElement.id + '\n' + targetElement.getAttribute('name') + '\n' + targetElement.tagName);
		
		// turn the pointer-events back on, so we can grab this item later
		DragTarget.setAttributeNS(null, 'pointer-events', 'all');
		
		// Needed for keeping track of blocks upon removal
		var blockexists = null;
		
		// Needed for when dumbasses waste blocks
		var blockwasted = false;
		
		// GRID PLACEMENT // If the object is placed directly on the grid...
		if ('gridTransform' == targetElement.parentNode.id)
		{
			// Number ID of the grid element
			gridnum = targetElement.id.substr(7, 10);
			// Get the color of the block
			blockcolor = DragTarget.getAttributeNS(null, 'block-color');
			
			// Find grid coordinates
			coor_x = Math.floor(gridnum / 16); // grid_x & grix_y are being changed somewhere along the road...
			coor_y = gridnum % 16;
			
			// Adds object to grid, plus some draw order logic (to keep visual perspective sane)
			if (Voxel[(coor_x - 1)] !== undefined) {
				if (Voxel[(coor_x - 1)][coor_y] !== undefined) {
					if (Voxel[(coor_x - 1)][coor_y][0] !== undefined && Voxel[(coor_x - 1)][coor_y][0] !== DragTarget.id) {
						blockEast = Voxel[(coor_x - 1)][coor_y][0];
						targetElement.parentNode.insertBefore(DragTarget, document.getElementById(blockEast));
					}
				}
			} else if (Voxel[coor_x] !== undefined) {
				if (Voxel[coor_x][(coor_y + 1)] !== undefined) {
					if (Voxel[coor_x][(coor_y + 1)][0] !== undefined && Voxel[coor_x][(coor_y + 1)][0] !== DragTarget.id) {
						blockNorth = Voxel[coor_x][(coor_y + 1)][0];
						targetElement.parentNode.insertBefore(DragTarget, document.getElementById(blockNorth));
					}
				}
			} else {
				targetElement.parentNode.appendChild(DragTarget);
			}

			bbox = targetElement.getBBox();
			
			DragTarget.setAttributeNS(null, 'transform', 'translate(' + (bbox.x + 5) + ',' + (bbox.y - 27) + ')');
			
			if(blockcolor == 'clear'){
				blockattrs = new Array(DragTarget.id, coor_x, coor_y, 0, blockcolor, 'v');
			} else {
				blockattrs = new Array(DragTarget.id, coor_x, coor_y, 0, blockcolor, 's');
			}
			
			// Register the block with the Field
			Field[DragTarget.id] = blockattrs;
			Field.length++;
			
			// Register voxel
			VoxArray(Voxel, coor_x, coor_y, 0, DragTarget.id);
			
			blockexists = true;
			
			// Check replaceblock; if present, check the kind and add a new block of the same kind,
			// then set that attribute to false so we don't call this function when moving an already-placed block.
			if (DragTarget.getAttributeNS(null, 'replaceblock') !== 'false') {
				DragTarget.setAttributeNS(null, 'replaceblock', false);
				populateNamed(blockcolor);
			} else if (DragTarget.getAttributeNS(null, 'replaceblock') == 'false') {
				blockmoved = true;
			} else {
				loggit('Move error!');
			}
		}
		
		// STACK PLACEMENT // ...or if dragged onto the top of another block
		else if ( targetElement.id == 'outline' ) {
			targetElement.parentNode.appendChild( DragTarget );

			var dragParentCTM = targetElement.parentNode.getCTM();

			bbox = targetElement.getBBox();
			// Snap object to grid
			DragTarget.setAttributeNS(null, 'transform', 'translate(' + (bbox.x - 1) + ',' + (bbox.y - 34) + ')');
			
			// Get the color of the block
			//blockcolor = DragTarget.childNodes[1].getAttribute('fill');
			blockcolor = DragTarget.getAttributeNS(null, 'block-color');
			
			x = Field[targetElement.parentNode.id][1];
			y = Field[targetElement.parentNode.id][2];
			z = Field[targetElement.parentNode.id][3];
			z++; // bad, needs to be smarter
			
			if(blockcolor == 'clear'){
			blockattrs = new Array(DragTarget.id, x, y, z, blockcolor, 'v');
			} else {
			blockattrs = new Array(DragTarget.id, x, y, z, blockcolor, 's');
			}
			
			// Register the block with the Field
			Field[DragTarget.id] = blockattrs;
			Field.length++;
			
			VoxArray(Voxel, x, y, z, DragTarget.id);
			
			blockexists = true;
			
			// Check replaceblock; if present, check the kind and add a new block of the same kind,
			// then set that attribute to false so we don't call this function when moving an already-placed block.
			if (DragTarget.getAttributeNS(null, 'replaceblock') !== 'false') {
				DragTarget.setAttributeNS(null, 'replaceblock', false);
				populateNamed(blockcolor);
			} else if (DragTarget.getAttributeNS(null, 'replaceblock') == 'false') {
				blockmoved = true;
			} else {
				loggit('Move error!');
			}
		}		
		// REMOVAL //
		else if ( targetElement.id == 'use3286' ) {
			blockcolor = DragTarget.getAttributeNS(null, 'block-color');
			if (DragTarget.getAttributeNS(null, 'replaceblock') !== 'false') {
				DragTarget.setAttributeNS(null, 'replaceblock', false);
				populateNamed(blockcolor);
				blockwasted = true;
			} else {
				x = Field[DragTarget.id][1];
				y = Field[DragTarget.id][2];
				z = Field[DragTarget.id][3];
		
				Field[DragTarget.id] = null;
				Field.length--
				
				VoxArray(Voxel, x, y, z, null);
			}
			
			targetElement.appendChild(DragTarget);
			
			targetElement.removeChild(DragTarget);
			
			blockexists = false;
		} else {
			loggit('Placement error.');
		}
		
		var blockmoved = false;
		
		// All the attributes a block should need. Run only if the block still exists.
		if(blockexists) {
			id = Field[DragTarget.id][0];
			x = Field[DragTarget.id][1];
			y = Field[DragTarget.id][2];
			z = Field[DragTarget.id][3];
			color = Field[DragTarget.id][4];
			if(Field[DragTarget.id][5] == 's'){
				functionality = 'structural';
			} else if (Field[DragTarget.id][5] == 'v') {
				functionality = 'void';
			}
		}
		
		// Log the block's position.
		if (isNaN(x)) {
			loggit('Element placed offgrid.');
		} else if (blockmoved == true) {
			loggit('A ' + color + ' ' + functionality + ' element moved to ' + x + ', ' + y + ', ' + z + '.');
		} else if (blockexists == false && blockwasted == false) {
			loggit("Block removed.");
		} else if (blockwasted == true) {
			loggit("Don't waste blocks!");
		} else {
			loggit('A ' + color + ' ' + functionality + ' element instantiated at ' + x + ', ' + y + ', ' + z + '.');
		}
		
		// set the global variable to null, so nothing will be dragged until we
		//    grab the next element
		DragTarget = null;
	}
};

function GetTrueCoords(evt)
{
	// find the current zoom level and pan setting, and adjust the reported
	//    mouse position accordingly
	var newScale = SVGRoot.currentScale;
	var translation = SVGRoot.currentTranslate;
	TrueCoords.x = (evt.clientX - translation.x)/newScale;
	TrueCoords.y = (evt.clientY - translation.y)/newScale;
};

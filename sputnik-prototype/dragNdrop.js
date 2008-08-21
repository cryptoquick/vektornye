//	Copyright 2008 Alex Trujillo

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

var TrueCoords = null;
var GrabPoint = null;
var BackDrop = null;
var DragTarget = null;

function Init(evt)
{
	// Make the grid (x,y) by getting the width & height of the root SVG element
	gridTransform(15, 15, SVGRoot.getBBox().width, SVGRoot.getBBox().height);
	
	// Create a new block based on the template (hidden outside of the screen)
	randoBlock();
	
	// these svg points hold x and y values...
	//    very handy, but they do not display on the screen (just so you know)
	TrueCoords = SVGRoot.createSVGPoint();
	GrabPoint = SVGRoot.createSVGPoint();
	
	// this will serve as the canvas over which items are dragged.
	//    having the drag events occur on the mousemove over a backdrop
	//    (instead of the dragged element) prevents the dragged element
	//    from being inadvertantly dropped when the mouse is moved rapidly
	BackDrop = document.getElementById('BackDrop');
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
	
	// you cannot drag the background itself, so ignore any attempts to mouse down on it
	// Make sure the element is not in the noFlyZone
	// Took this out, forgot why it was there...  || targetElement == SVGRoot.target
	// We might want to reverse that to make only flying objects fly, rather than making non-flying object not fly, like we do now.
	// if (BackDrop != targetElement && nFZ != 'nFZ')
	if (targetElement.parentNode.id.substr(0,5) == 'block')
	{
		// testing zone
			//alert(targetElement.getAttribute('id').substr(0,3));
		
		//set the item moused down on as the element to be dragged
		DragTarget = targetElement.parentNode;

		// move this element to the "top" of the display, so it is (almost)
		//    always over other elements (exception: in this case, elements that are
		//    "in the folder" (children of the folder group) with only maintain
		//    hierarchy within that group
		DragTarget.parentNode.appendChild( DragTarget );
		// turn off all pointer events to the dragged element, this does 2 things:
		//    1) allows us to drag text elements without selecting the text
		//    2) allows us to find out where the dragged element is dropped (see Drop)
		DragTarget.setAttributeNS(null, 'pointer-events', 'none');
		
		// we need to find the current position and translation of the grabbed element,
		//    so that we only apply the differential between the current location
		//    and the new location
		var transMatrix = DragTarget.getCTM();
		GrabPoint.x = TrueCoords.x - Number(transMatrix.e);
		GrabPoint.y = TrueCoords.y - Number(transMatrix.f);
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
		
		// this is also KLUDGY and needs work
		// var transformBucket = DragTarget.getAttribute('transform').indexOf('scale')
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
		if ( 'gridTransform' == targetElement.parentNode.parentNode.id )
		{
			// if the dragged element is dropped on an element that is a child
			//    of the folder group, it is inserted as a child of that group
			targetElement.parentNode.appendChild( DragTarget );
			//DragTarget.setAttributeNS(null, 'transform', 'translate(' + newX + ',' + newY + ')' + 'scale(0.5)');
			//targetElement.setAttributeNS(null, 'stroke-width', '5');
			//targetElement.setAttributeNS(null, 'fill', '#fff');
			bbox = targetElement.getBBox();
			// Snap object to grid
			DragTarget.setAttributeNS(null, 'transform', 'translate(' + (bbox.x + 5) + ',' + (bbox.y - 27) + ')');
						
			// Set DebugGrid to the new color
			gridnum = targetElement.id.substr(7, 10);
			blockcolor = DragTarget.childNodes[1].getAttribute('fill');
			document.getElementById('debugGrid-' + gridnum).setAttributeNS(null, 'fill', blockcolor);
			
			// Give us a new block.
			randoBlock();

			//alert(DragTarget.id + ' has been dropped into a folder, and has been inserted as a child of the containing group.');
		}
		// If dragged onto the top of another block
		else if ( targetElement.id == 'outline' )
		{
			// if the dragged element is dropped on an element that is a child
			//    of the folder group, it is inserted as a child of that group
			targetElement.parentNode.appendChild( DragTarget );
			//DragTarget.setAttributeNS(null, 'transform', 'translate(' + newX + ',' + newY + ')' + 'scale(0.5)');
			//targetElement.setAttributeNS(null, 'stroke-width', '5');
			//targetElement.setAttributeNS(null, 'fill', '#fff');
			bbox = targetElement.getBBox();
			// Snap object to grid
			DragTarget.setAttributeNS(null, 'transform', 'translate(' + (bbox.x - 1) + ',' + (bbox.y - 34) + ')');
						
			// Set DebugGrid to the new color
			//gridnum = targetElement.parentNode.id.substr(7, 10);
			//blockcolor = DragTarget.childNodes[1].getAttribute('fill');
			//document.getElementById('debugGrid-' + gridnum).setAttributeNS(null, 'fill', blockcolor);
			// Give us a new block.
			randoBlock();

			//alert(DragTarget.id + ' has been dropped into a folder, and has been inserted as a child of the containing group.');
		}
		else
		{
			// for this example, you cannot drag an item out of the folder once it's in there;
			//    however, you could just as easily do so here
			//alert(DragTarget.id + ' has been dropped on top of ' + targetElement.id);
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

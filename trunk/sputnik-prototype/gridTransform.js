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
//	gridTransform.js uses the Sylvester javascript library. You can find it here:
//	http://sylvester.jcoglan.com/
//	Here a grid is created, its coordinates transformed using matrix math courtesy of
//	Sylvester, then output as paths to the display. This is also done for the debug
//	grid. There's also code here to place SVG code into the DOM, as well as some other
//	debugging functionality.


svgNS = 'http://www.w3.org/2000/svg';

// Turns a string into something DOM can understand
function parseSVG(str) {
  str = '<g xmlns="http://www.w3.org/2000/svg">' + str + '</g>';
  return new DOMParser().parseFromString(str, "text/xml").childNodes[0];
}

function parseXML (doc, str) {
	doc2 = (new DOMParser()).parseFromString(str, "text/xml");
	//doc.importNode(doc2, true);
	return doc2.firstChild;
}

function gridTransform(grid_x, grid_y, screen_x, screen_y) {
	// Start Timer
	var start = new Date(); 
	
	// Initialize variables
	var size_x = 45;
	var size_y = 45;
	var mid_x = Math.floor((screen_x / 2) - (Math.sqrt(2) * size_x * grid_x) / 2);
	var mid_y = Math.floor((screen_y / 2));
	var offset_x = mid_x;
	var offset_y = mid_y;
	var UIbar = 3;
	var M1 = [];
	var z = 0;
		
	// Populate matrices with initial 2D grid
	for (x = 0; x <= (grid_x - 1); x++) {
		for (y = 0; y <= (grid_y - 1); y++) {
			M1[z] = $M([
				[(x * size_x), (y * size_y)],
				[(x * size_x + size_x), (y * size_y)],
				[(x * size_x + size_x), (y * size_y + size_y)],
				[(x * size_x), (y * size_y + size_y)]
			]);
			z++;
		}
	}

	// 45 degrees (in radians)
	angle = Math.PI / 4;
	
	// Scale y-axis by half
	var M25 = $M([
		[1,0],
		[0,0.5]
	]);
	
	// Translates across screen
	var M26 = $M([
		[offset_x, offset_y],
		[offset_x, offset_y],
		[offset_x, offset_y],
		[offset_x, offset_y]
	]);

	// This applies the angle and the scale to the 2D grid to make it into 2.5D isometric
	M2 = Matrix.Rotation(angle);
	M2 = M2.x(M25);
	
//	<g id="gridTransform" fill="#DDD" stroke="#777" stroke-width="1">
	gridGroup = document.createElementNS(svgNS, 'g');
	gridGroup.setAttributeNS(null, 'id', 'gridTransform');
	gridGroup.setAttributeNS(null, 'fill', '#DDD');
	gridGroup.setAttributeNS(null, 'stroke', '#777');
	gridGroup.setAttributeNS(null, 'stroke-width', '1');
	
	// Create string formatted for SVG paths, thus making squares
	for (i= 0; i <= (grid_x * grid_y - 1); i++) {
		var M = M1[i].x(M2); // Rotate & Squash
		N = M.round(); // Whole numbers
		N = N.add(M26); // Translate coordinates
		
		pathElement = document.createElementNS(svgNS, 'path');
		pathElement.setAttributeNS(null, 'id', 'bgGrid-' + i);
		
		path = '';
		path += 'M ' + N.e(1,1) + ' ' + N.e(1,2);
		path += ' L ' + N.e(2,1) + ' ' + N.e(2,2);
		path += ' L ' + N.e(3,1) + ' ' + N.e(3,2);
		path += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
		path += ' z';
		
		pathElement.setAttributeNS(null, 'd', path);
		gridGroup.appendChild(pathElement);
	}
	
	gridparent = document.getElementById('gridContainer');
	gridparent.appendChild(gridGroup);

	// End Timer
	end = new Date();
	
	// Add timer and resolution info to Debug Box
	loggit("Grid Transform took " + (end - start) + " milliseconds to render.");
	loggit("Available screen: " + screen_x + " pixels by " + screen_y + " pixels.");
}
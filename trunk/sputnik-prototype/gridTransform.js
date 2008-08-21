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

// Turns a string into something DOM can understand
function parseSVG(str) {
  str = '<g xmlns="http://www.w3.org/2000/svg">' + str + '</g>';
  return new DOMParser().parseFromString(str, "text/xml").childNodes[0];
}

function parseSVGText(str) {
  str = '<text xmlns="http://www.w3.org/2000/svg" id="debugText" x="220" y="30" font-family="Verdana" font-size="12" fill="black">' + str + '</text>';
  return new DOMParser().parseFromString(str, "text/xml").childNodes[0];
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
		
	var path = "";
	
	// Create string formatted for SVG paths, thus making squares
	for (i= 0; i <= (grid_x * grid_y - 1); i++) {
		var M = M1[i].x(M2); // Rotate & Squash
		N = M.round(); // Whole numbers
		N = N.add(M26); // Translate coordinates
		path += "<path id=\"bgGrid-" + i + "\" d=\"";
		path += 'M ' + N.e(1,1) + ' ' + N.e(1,2);
		path += ' L ' + N.e(2,1) + ' ' + N.e(2,2);
		path += ' L ' + N.e(3,1) + ' ' + N.e(3,2);
		path += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
		path += " z\" />\n";
	}
	
	var M3 = $M([
		[0,0],
		[(size_x * grid_x),0],
		[(size_x * grid_x),(size_y * grid_y)],
		[0,(size_y * grid_y)]
	]);
	
	// Create grid shadow
	M = M3.x(M2); // Rotate & Squash over each iteration
	N = M.round(); // Whole numbers
	N = N.add(M26); // Translate coordinates
	path += "<path id=\"bgGridShadowLeft\" fill=\"url(#GrisGradLeft)\" stroke=\"none\" stroke-width=\"0\" d=\"";
	path += 'M ' + N.e(1,1) + ' ' + N.e(1,2);
	path += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
	path += ' L ' + N.e(4,1) + ' ' + (N.e(4,2) + 35);
	path += 'L ' + N.e(1,1) + ' ' + (N.e(1,2) + 35);
	path += " z\" />\n";
	
	path += "<path id=\"bgGridShadowRight\" fill=\"url(#GrisGradRight)\" stroke=\"none\" stroke-width=\"0\" d=\"";
	path += 'M ' + N.e(3,1) + ' ' + N.e(3,2);
	path += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
	path += ' L ' + N.e(4,1) + ' ' + (N.e(4,2) + 35);
	path += 'L ' + N.e(3,1) + ' ' + (N.e(3,2) + 35);
	path += " z\" />\n";
	
	// Add string object into SVG DOM
	function $(x) { return document.getElementById(x); }
	$("gridTransform").appendChild(parseSVG(path));

	var debug = "";
	
		// Scale y-axis by half
	var M45 = $M([
		[0.25,0],
		[0,0.25]
	]);
	
	// Translates across screen
	var M46 = $M([
		[215, 95],
		[215, 95],
		[215, 95],
		[215, 95]
	]);

	// This applies the angle and the scale to the 2D grid to make it into 2.5D isometric
	//M4 = Matrix.Rotation(angle);
	//M4 = M4.x(M45);

	//alert(M4.inspect());

	// Build Debug Grid
	for (i= 0; i <= (grid_x * grid_y - 1); i++) {
		M = M1[i].x(M45); // Iterate
		N = M.round(); // Whole numbers
		N = N.add(M46); // Translate coordinates
		debug += "<path id=\"debugGrid-" + i + "\" d=\"";
		debug += 'M ' + N.e(1,1) + ' ' + N.e(1,2);
		debug += ' L ' + N.e(2,1) + ' ' + N.e(2,2);
		debug += ' L ' + N.e(3,1) + ' ' + N.e(3,2);
		debug += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
		debug += " z\" />\n";
	}
	
	// Add string object into SVG DOM
	function $(x) { return document.getElementById(x); }
	$("debugGrid").appendChild(parseSVG(debug));
	
	// End Timer
	end = new Date();
	
	// Add timer and resolution info to Debug Box
	document.getElementById("debugText").appendChild(parseSVGText("<tspan x=\"220\">Debug:</tspan>" +
	"<tspan x=\"220\" dy=\"20\">Grid Transform took " + (end - start) + " milliseconds to render.</tspan>" + 
	"<tspan x=\"220\" dy=\"20\">Available size: " + (screen_x - 75) + " pixels by " + (screen_y - 75) + " pixels.</tspan>"));
}
function UITransform(mid_x, mid_y) {
	var M1 = [];
	var z = 0;

	UIsize_x = 60;
	UIsize_y = 60;
	
	grid_y = 12;
	
	extUI = Math.floor((Math.sqrt(2) * 60))
	
	// Populate matrices with initial 2D grid
	for (x = 0; x <= 1; x++) {
		for (y = 0; y <= (grid_y - 1); y++) {
			M1[z] = $M([
				[(x * UIsize_x), (y * UIsize_y)],
				[(x * UIsize_x + UIsize_x), (y * UIsize_y)],
				[(x * UIsize_x + UIsize_x), (y * UIsize_y + UIsize_y)],
				[(x * UIsize_x), (y * UIsize_y + UIsize_y)]
			]);
			z++;
		}
	}
	
	/// For Left UI
	
	// Scale y-axis by half	
	var M25 = $M([
		[1,0],
		[0,0.5]
	]);

	offset_x = mid_x - extUI;
	offset_y = mid_y + (extUI / 2);

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
	
	/// For Right UI
	
	// 90 degrees (in radians)
	angle = ((Math.PI / 2) * 3) + (Math.PI / 4);
	
	extUI_y = Math.floor((Math.sqrt(2) * 60 * 12));
	
	offset_x = mid_x + extUI_y;
	offset_y = mid_y;

	// Translates across screen
	var M36 = $M([
		[offset_x, offset_y],
		[offset_x, offset_y],
		[offset_x, offset_y],
		[offset_x, offset_y]
	]);
	
	// This applies the angle and the scale to the 2D grid to make it into 2.5D isometric
	M3 = Matrix.Rotation(angle);
	M3 = M3.x(M25);
	
	//Array.concat(M2, M3);

	/// Left UI
		
	// Creates the gridUI Group
	UIGroup = document.createElementNS(svgNS, 'g');
	UIGroup.setAttributeNS(null, 'id', 'gridUI-Left');
	UIGroup.setAttributeNS(null, 'fill', '#729fcf');
	UIGroup.setAttributeNS(null, 'stroke', '#204a87');
	UIGroup.setAttributeNS(null, 'stroke-width', '1');
	
	// Create string formatted for SVG paths, thus making squares
	for (i= 0; i <= (2 * grid_y - 1); i++) {
		var M = M1[i].x(M2); // Rotate & Squash
		N = M.round(); // Whole numbers
		N = N.add(M26); // Translate coordinates
		
		pathElement = document.createElementNS(svgNS, 'path');
		pathElement.setAttributeNS(null, 'id', 'UILeft-' + i);
		
		path = '';
		path += 'M ' + N.e(1,1) + ' ' + N.e(1,2);
		path += ' L ' + N.e(2,1) + ' ' + N.e(2,2);
		path += ' L ' + N.e(3,1) + ' ' + N.e(3,2);
		path += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
		path += ' z';
		
		pathElement.setAttributeNS(null, 'd', path);
		UIGroup.appendChild(pathElement);
	}

	// Add the entire grid group. Everything in this script adds to that group, so this comes last.
	gridparent = document.getElementById('gridContainer');
	gridparent.appendChild(UIGroup);

	/// Right UI

	// Creates the gridUI Group
	UIGroup = document.createElementNS(svgNS, 'g');
	UIGroup.setAttributeNS(null, 'id', 'gridUI-Right');
	UIGroup.setAttributeNS(null, 'fill', '#fcaf3e');
	UIGroup.setAttributeNS(null, 'stroke', '#ce5c00');
	UIGroup.setAttributeNS(null, 'stroke-width', '1');
	
	// Create string formatted for SVG paths, thus making squares
	for (i= 0; i <= (2 * grid_y - 1); i++) {
		var M = M1[i].x(M3); // Rotate & Squash
		N = M.round(); // Whole numbers
		N = N.add(M36); // Translate coordinates
		
		pathElement = document.createElementNS(svgNS, 'path');
		pathElement.setAttributeNS(null, 'id', 'UIRight-' + i);
		
		path = '';
		path += 'M ' + N.e(1,1) + ' ' + N.e(1,2);
		path += ' L ' + N.e(2,1) + ' ' + N.e(2,2);
		path += ' L ' + N.e(3,1) + ' ' + N.e(3,2);
		path += ' L ' + N.e(4,1) + ' ' + N.e(4,2);
		path += ' z';
		
		pathElement.setAttributeNS(null, 'd', path);
		UIGroup.appendChild(pathElement);
	}

	// Add the entire grid group. Everything in this script adds to that group, so this comes last.
	gridparent = document.getElementById('gridContainer');
	gridparent.appendChild(UIGroup);

}
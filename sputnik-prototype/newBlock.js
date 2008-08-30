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
//	newBlock.js provides code specific to the editor. It duplicates a group of
//	SVG elements, then assigns it a certain RGB color. It builds the palette of colors
//	seen when the program first starts. It also contains a function for random colors.

var tick = 100

function array_search (array, val) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][3] == val) { // Modified to look inside the nested arrays to find the colors
			return i;
		}
	}
	return false;
}
 
function array_search_key(array,num) {
	if (array[num]) return true;
	return false;
}

var palette = new Array();
palette[0] = [164, 0, 0, 'red', null];
palette[1] = [211, 127, 4, 'orange', null];
palette[2] = [213, 184, 8, 'yellow', null];
palette[3] = [42, 197, 18, 'green', null];
palette[4] = [43, 84, 200, 'blue', null];
palette[5] = [147, 29, 199, 'purple', null];
palette[6] = [190, 67, 180, 'pink', null];
palette[7] = [201, 202, 188, 'white', null];
palette[8] = [55, 48, 51, 'black', null];
palette[9] = [255, 255, 255, 'transparent', null];
palette[10] = [0, 0, 0, 'void', null];
palette[11] = [0, 0, 0, 'random', null];

function block(movX, movY, color) {
	tick++;
	blockBlank = dupeBlock(tick, movX, movY);
	if (color[3] == 'random') {
		blockColor = randomColor(blockBlank);
	} else if (color[3] == 'transparent') {
		blockColor = transparentColor(blockBlank, color[0], color[1], color[2]);
	} else if (color[3] == 'void') {
		blockColor = voidColor(blockBlank);
	} else {
		blockColor = setColor(blockBlank, color[0], color[1], color[2]);
	}
	return blockColor;
}

function dupeBlock(blockId, movX, movY) {
	var obj = document.getElementById("blockBeta").cloneNode(true);
	obj.setAttributeNS(null, "id", "block" + blockId);
	obj.setAttributeNS(null, "transform", "translate(" + movX + "," + movY + ")");
	return obj;
}

function populatePalette() {
	for (i= 0; i <= (palette.length - 2); i++) {
		targetElement = document.getElementById('UILeft-' + i);
		bbox = targetElement.getBBox();
		blok = block((bbox.x + 55), (bbox.y - 15), palette[i])
		blok.setAttributeNS(null, 'replaceblock', palette[i][3]);
		blok.setAttributeNS(null, 'block-color', palette[i][3]);
		palette[i][4] = blok.id;
		SVGRoot.appendChild(blok);
	}
	
	// bring the Trash bin into view
	bbox = document.getElementById('UIRight-0').getBBox();
	document.getElementById('AndyTrashCan').setAttributeNS(null, 'transform', 'translate(' + (bbox.x + 12) + ', ' + (bbox.y - 10) + ') scale(0.5)');
}

function populateNamed(colorname) {
	e = array_search(palette, colorname);
	if(colorname == 'random') {
		targetElement = document.getElementById('logo');
//		bbox = targetElement.getBBox();
		blok = block(((window.innerWidth / 2) - 26), (window.innerHeight - 93), palette[e])
	} else {
		targetElement = document.getElementById('UILeft-' + e);
		bbox = targetElement.getBBox();
		blok = block((bbox.x + 55), (bbox.y - 15), palette[e])
	}

	blok.setAttributeNS(null, 'replaceblock', palette[e][3]);
	blok.setAttributeNS(null, 'block-color', palette[e][3]);
	if (e + 1 == palette.length) {
		SVGRoot.appendChild(blok);
	} else {
		SVGRoot.insertBefore(blok, document.getElementById(palette[(e+1)][4]));
	}
	palette[e][4] = blok.id;
}

/// These need to be consolidated into a single function!

function setColor(obj, colorR, colorG, colorB) {
	colorLeft = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	colorRight = "rgb(" + (colorR + 20) + "," + (colorG + 20) + "," + (colorB + 20) + ")";
	colorTop = "rgb(" + (colorR + 40) + "," + (colorG + 40) + "," + (colorB + 40) + ")";
	colorLines = "rgb(" + (colorR + 50) + "," + (colorG + 50) + "," + (colorB + 50) + ")";
	obj.childNodes[1].setAttributeNS(null, "fill", colorLeft);
	obj.childNodes[3].setAttributeNS(null, "fill", colorRight);
	obj.childNodes[5].setAttributeNS(null, "fill", colorTop);
	obj.childNodes[7].setAttributeNS(null, "stroke", colorLines);
	obj.setAttributeNS(null, "fill-opacity", 1.0);
	obj.setAttributeNS(null, "stroke-opacity", 1.0);
	return obj;
}

function randomColor(obj) {
	colorR = Math.round(Math.random() * 215);
	colorG = Math.round(Math.random() * 215);
	colorB = Math.round(Math.random() * 215);
	colorLeft = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	colorRight = "rgb(" + (colorR + 20) + "," + (colorG + 20) + "," + (colorB + 20) + ")";
	colorTop = "rgb(" + (colorR + 40) + "," + (colorG + 40) + "," + (colorB + 40) + ")";
	colorLines = "rgb(" + (colorR + 50) + "," + (colorG + 50) + "," + (colorB + 50) + ")";
	obj.childNodes[1].setAttributeNS(null, "fill", colorLeft);
	obj.childNodes[3].setAttributeNS(null, "fill", colorRight);
	obj.childNodes[5].setAttributeNS(null, "fill", colorTop);
	obj.childNodes[7].setAttributeNS(null, "stroke", colorLines);
	obj.setAttributeNS(null, "fill-opacity", 1.0);
	obj.setAttributeNS(null, "stroke-opacity", 1.0);
	return obj;
}

function transparentColor(obj, colorR, colorG, colorB) {
	colorLeft = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	colorRight = "rgb(" + (colorR + 20) + "," + (colorG + 20) + "," + (colorB + 20) + ")";
	colorTop = "rgb(" + (colorR + 40) + "," + (colorG + 40) + "," + (colorB + 40) + ")";
	colorLines = 'rgb(52,101,164)';
	obj.childNodes[1].setAttributeNS(null, "fill", colorLeft);
	obj.childNodes[3].setAttributeNS(null, "fill", colorRight);
	obj.childNodes[5].setAttributeNS(null, "fill", colorTop);
	obj.childNodes[7].setAttributeNS(null, "stroke", colorLines);
	obj.childNodes[9].setAttributeNS(null, "stroke", colorLines);
	obj.setAttributeNS(null, "fill-opacity", 0.3);
	obj.setAttributeNS(null, "stroke-opacity", 0.5);
	
	createInlay(obj, colorLines);
	
	createLine(obj, 26, 0, 26, 30);
	createLine(obj, 1, 43, 26, 30);
	createLine(obj, 51, 43, 26, 30);
	
	return obj;
}

function voidColor(obj) {
	colorR = 255;
	colorG = 255;
	colorB = 255;
	colorLeft = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	colorRight = "rgb(" + (colorR + 20) + "," + (colorG + 20) + "," + (colorB + 20) + ")";
	colorTop = "rgb(" + (colorR + 40) + "," + (colorG + 40) + "," + (colorB + 40) + ")";
	colorLines = 'rgb(255,255,255)';
	obj.childNodes[1].setAttributeNS(null, "fill", colorLeft);
	obj.childNodes[3].setAttributeNS(null, "fill", colorRight);
	obj.childNodes[5].setAttributeNS(null, "fill", colorTop);
	obj.childNodes[7].setAttributeNS(null, "stroke", colorLines);
	obj.childNodes[9].setAttributeNS(null, "stroke", colorLines);
	obj.setAttributeNS(null, "fill-opacity", 0.0);
	obj.setAttributeNS(null, "stroke-opacity", 0.7);
	
	createInlay(obj, colorLines);
	
	createLine(obj, 26, 0, 26, 30);
	createLine(obj, 1, 43, 26, 30);
	createLine(obj, 51, 43, 26, 30);

	return obj;
}

function createInlay(obj, colorLines) {
	bgInlay = document.createElementNS(svgNS, 'g');
	bgInlay.setAttributeNS(null, 'id', 'bgInlay');
	bgInlay.setAttributeNS(null, 'stroke', colorLines);
	bgInlay.setAttributeNS(null, 'stroke-width', 2);
	bgInlay.setAttributeNS(null, 'stroke-opacity', 0.5);
	obj.appendChild(bgInlay);
}

function createLine(obj, x1, y1, x2, y2) {
	bgInlay = document.createElementNS(svgNS, 'line');
	bgInlay.setAttributeNS(null, 'x1', x1);
	bgInlay.setAttributeNS(null, 'y1', y1);
	bgInlay.setAttributeNS(null, 'x2', x2);
	bgInlay.setAttributeNS(null, 'y2', y2);
	obj.childNodes[11].appendChild(bgInlay);
}
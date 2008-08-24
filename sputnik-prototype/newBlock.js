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
//	newBlock.js provides code specific to the editor, duplicating a group of
//	SVG elements, then assigns it a certain RGB color. It also contains a
//	function for random colors.

var tick = 100

function dupoBlock(blockId, movX, movY) {
	var obj = document.getElementById("blockBeta").cloneNode(true);
	obj.setAttribute("id", "block" + blockId);
	obj.setAttribute("transform", "translate(" + movX + "," + movY + ")");
	document.documentElement.appendChild(obj);
	assignCol(blockId);
}
tick = 100;
function randoBlock() {
	tick = tick + 1;
	movX = 75;
	movY = 75;
	dupoBlock(tick, movX, movY);
}
function assignCol(blockId) {
	colorR = Math.round(Math.random() * 215);
	colorG = Math.round(Math.random() * 215);
	colorB = Math.round(Math.random() * 215);
	colorLeft = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	colorRight = "rgb(" + (colorR + 20) + "," + (colorG + 20) + "," + (colorB + 20) + ")";
	colorTop = "rgb(" + (colorR + 40) + "," + (colorG + 40) + "," + (colorB + 40) + ")";
	colorLines = "rgb(" + (colorR + 50) + "," + (colorG + 50) + "," + (colorB + 50) + ")";
	document.getElementById("block" + blockId).childNodes[1].setAttribute("fill", colorLeft);
	document.getElementById("block" + blockId).childNodes[3].setAttribute("fill", colorRight);
	document.getElementById("block" + blockId).childNodes[5].setAttribute("fill", colorTop);
	document.getElementById("block" + blockId).childNodes[7].setAttribute("stroke", colorLines);
}
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
//	loggit.js takes a message and outputs it to a debug box on the screen.
//	Because the box does not have a scroll bar, I had to write scrolling code.

var svgNS = 'http://www.w3.org/2000/svg';

function loggit(str) {
	var log = document.getElementById("debugText");
	
	var childCount = log.getElementsByTagName('tspan').length;

	if(childCount >= 4){
		log.removeChild(log.firstChild);
		log.firstChild.setAttributeNS(null, 'dy', 5);
	}
	
	var textElement = document.createElementNS(svgNS, 'tspan');
	textElement.setAttributeNS(null, 'x', '20');
	textElement.setAttributeNS(null, 'dy', '18');

	textElement.textContent = str;
	
	log.appendChild(textElement);
}
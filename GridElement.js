"use strict";

function GridElement(i, j) {
	this.i = i;
	this.j = j;
	this.hasBomb = false;
	this.isCovered =true;
	this.bombsNear = 0;
	this.divElem = null;
	this.isMarked = false;
}

GridElement.width = 23;
GridElement.height =23;

GridElement.prototype.makeDivGridElem = function(parent,i,j) {
	var elem = document.createElement('div');
	elem.id = 'gridElement[' + i + '][' + j + ']';
	elem.className = 'grid-elem';
	elem.style.left = i * 23+'px';
	elem.style.top = j * 23+'px';
	parent.appendChild(elem);

	this.divElem = elem;
}

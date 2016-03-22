"use strict";

var gridArr;
var gridDivArr;
var isMarkedCount = 0;
var BOMB_QUANT = 10;
var FIELD_SIZE = 10;
var OPENED_ELEM_COLOR = '#FCFCFC';
var OPENED_NUM_ELEM_COLOR = '#CCCCCC';
var LOOSE_STRING = 'BANG - game over! Click to try again.';
var WIN_STRING = 'You won! Click to play again!';
var TIME_STRING = '&#128336; 00';
var TIME_ICON = '&#128336;';
var BOMB_STRING = '&#128163;10';
var BOMB_ICON ='&#128163;';
var BOMB = '✵';
var SUSPECTED = '⚒';
var firstClick = false;
var timer;

window.onload = function() {
	createPlayField(gridArr);	
}

function createPlayField(gridArr) {
	firstClick = false;
	isMarkedCount = 0;

	createField(document.body,'game-field',null,'div');
	createField(document.body,'status-field-timer',TIME_STRING,'div');
	createField(document.body,'status-field-bombs',BOMB_STRING,'div');

	gridArr = fillArrayByElems();
	
	var gameField = document.getElementById('game-field');
	for (var i = 0; i < gridArr.length; i++) {
		for (var j = 0; j < gridArr.length; j++) {
			gridArr[i][j].makeDivGridElem(gameField,i,j);
			initalizeNewItem(gridArr[i][j],gridArr);
		}
	}		
}

function initalizeNewItem(gridElem, gridArr) {
	gridElem.divElem.addEventListener("click", function(){
		leftClickElem(this,gridArr);
	});
	gridElem.divElem.addEventListener('contextmenu', function(ev) {
		 ev.preventDefault();
		 rightClickElem(this,gridArr);
	});
}

function startTimer() {
	var timeCounter = 1;
	timer = setInterval(function() {
		var timeOutput;
		if(String(timeCounter).length === 1) {
			timeOutput = '0' + timeCounter++;
		} else {
			timeOutput = timeCounter++;
		}
			document.getElementById('status-field-timer').innerHTML = TIME_ICON +' ' + timeOutput;
	},1000);
};

function markedCounterLeft(){
	var bombOutput;
	if (String(BOMB_QUANT - isMarkedCount).length != 2) {
		bombOutput = '0' + (BOMB_QUANT - isMarkedCount);
	} else {
		bombOutput = BOMB_QUANT - isMarkedCount;
	}
	document.getElementById('status-field-bombs').innerHTML = BOMB_ICON + bombOutput;
}

function rightClickElem(e,gridArr){
	checkWin(gridArr);

	var elem = getClickedElem(e.id,gridArr);
	if(elem.isCovered){
		if(elem.isMarked === true){
			elem.isMarked = false;
			isMarkedCount--;
			elem.divElem.innerHTML ='';
		}else
		if(elem.isMarked === false && 
			isMarkedCount<BOMB_QUANT &&
			elem.isCovered){
			isMarkedCount++;
			elem.isMarked = true;
			elem.divElem.innerHTML =SUSPECTED;
			elem.divElem.style.color = 'black';
		}

		markedCounterLeft();
	}
}

function checkWin(gridArr){
	var openedCount = 1;
	var guessedCount = 1;
	for (var i = 0; i < gridArr.length; i++) {
		for (var j = 0; j < gridArr.length; j++) {
			if(!gridArr[i][j].isCovered){
				openedCount++;
			}
			if(gridArr[i][j].hasBomb === true){
				if(gridArr[i][j].isMarked ===true){
					guessedCount++;
				}
			}
		}
	}

	//console.log(openedCount + " " + guessedCount);
	if(openedCount === (FIELD_SIZE*FIELD_SIZE-BOMB_QUANT) ||
		guessedCount === BOMB_QUANT){
		gameOver(WIN_STRING);
	}
}

function leftClickElem(e,gridArr){
	checkWin(gridArr);
	
	var elem = getClickedElem(e.id,gridArr);	
	if(!firstClick){
		setBombs(gridArr,elem.i,elem.j);
		setNumbers(gridArr);
		startTimer();
		firstClick = true;
	};

	if(!elem.isMarked){
		if(elem.hasBomb){		
			elem.divElem.innerHTML = BOMB;
			elem.divElem.style.background = 'red';
			elem.divElem.style.fontSize='1.2em';
			gameOver(LOOSE_STRING);
		}else if(elem.bombsNear === 0){
			openFreeGridElems(gridArr,elem.i,elem.j);
		}else{
			elem.divElem.innerHTML = elem.bombsNear;
			gridElemColorNumber(elem);
			elem.divElem.style.background=OPENED_NUM_ELEM_COLOR;
		}
		elem.isCovered = false;
	}
}

function getClickedElem(name,gridArr){
	var i = parseInt(name.charAt(name.length-5));
	var j = parseInt(name.charAt(name.length-2));

	return gridArr[i][j];
}

function gameOver(msg){
	clearInterval(timer);
	var gameField = document.getElementById('game-field');
	var statusFieldTimer = document.getElementById('status-field-timer');
	var statusFieldBombs = document.getElementById('status-field-bombs');
	var endField = createField(gameField,'game-field',null,'div');
	endField.style.position = 'absolute';

	var gameOverBtn = createField(endField,'game-over',msg,'button');
	gameOverBtn.addEventListener("click", function(){
				clearField(gameOverBtn);
				clearField(endField);
				clearField(gameField);
				clearField(statusFieldTimer);
				clearField(statusFieldBombs);
				createPlayField(gridArr);
			});

}

function createField(parent,fieldName,msg,type){
	var field = document.createElement(type);
	field.className = fieldName;
	field.id = fieldName;
	if(msg){
		field.innerHTML = msg;
	}
	parent.appendChild(field);

	return field;
}

function clearField(gameField){
	gameField.parentNode.removeChild(gameField);
};

function openFreeGridElems(gridArr,i,j){
	i = Number(i);	j = Number(j);
	if( 
		gridArr[i][j].hasBomb ||
		!gridArr[i][j].isCovered ||
		gridArr[i][j].isMarked){
		return;
	}

	if(gridArr[i][j].bombsNear !== 0){//fix
		gridArr[i][j].divElem.click();	
		return;
	}

	gridArr[i][j].divElem.style.background = OPENED_ELEM_COLOR;
	gridArr[i][j].isCovered = false;

	if(j-1 >= 0){
		openFreeGridElems(gridArr,i,j-1);
	}
	if(i+1<FIELD_SIZE){
		openFreeGridElems(gridArr,i+1,j);
	}
	if(j+1<FIELD_SIZE){
		openFreeGridElems(gridArr,i,j+1);
	}
	if(i-1 >= 0){
		openFreeGridElems(gridArr,i-1,j);
	}

	return;
}

function fillArrayByElems(){
	var arr =[];

	for (var i = 0; i < FIELD_SIZE; i++) {
		arr[i] = [];
		for (var j = 0; j < FIELD_SIZE; j++) {
			arr[i][j] = new GridElement(i,j);
		}
	}

	return arr;
}

function setBombs(gridArr,i,j){
	var bombCount = 0;

	while(bombCount !== BOMB_QUANT){
		var gridElem = getRandomGridElem(gridArr);
		if(gridElem.hasBomb === false && bombCount < BOMB_QUANT+1 &&
			gridElem !== gridArr[i][j]){
			gridElem.hasBomb = true;
			bombCount++;
			//gridElem.divElem.style.background ='red';//checkbomb
		}
	}
}

function getRandomGridElem(gridArr){
	var i = Math.ceil(Math.random()*FIELD_SIZE-1);
	var j = Math.ceil(Math.random()*FIELD_SIZE-1);
	var gridElem = gridArr[i][j];

	return gridElem;
}

function setNumbers(gridArr){
	for (var i = 0; i < gridArr[0].length; i++) {
		var bombCount = 0;
		for (var j = 0; j < gridArr[0].length; j++) {

			var gridElem = gridArr[i][j];

			if(gridElem.hasBomb === false){		
				gridElem.bombsNear = getBombsNear(i,j,gridArr);
			}
		}
	}
}

function gridElemColorNumber(gridElem){
	switch(gridElem.bombsNear){
		case 1:
			gridElem.divElem.style.color= 'blue';
			break;
		case 2:
			gridElem.divElem.style.color= 'green';
			break;
		case 3:
			gridElem.divElem.style.color= 'darkred';
			break;
		case 4:
			gridElem.divElem.style.color= 'brown';
			break;
	}
}

function getBombsNear(i,j,gridArr){
	var indI = 0,indJ = 0, bombs =0;
	indI = i+1; indJ = j+1;
	if(indI < FIELD_SIZE && indJ < FIELD_SIZE && 
									gridArr[indI][indJ].hasBomb){
		bombs++;
	}
	indI = i-1; indJ = j-1;
	if(indI >= 0 && indJ >= 0 && gridArr[indI][indJ].hasBomb){
		bombs++;
	}
	indI = i-1; indJ = j+1;
	if(indI >= 0 && indJ < FIELD_SIZE && gridArr[indI][indJ].hasBomb){
		bombs++;
	}
	indI = i+1; indJ = j-1;
	if(indI < FIELD_SIZE && indJ >= 0 && gridArr[indI][indJ].hasBomb ){
		bombs++;
	}
	indI = i; indJ = j+1;
	if(indJ < FIELD_SIZE && gridArr[indI][indJ].hasBomb){
		bombs++;
	}
	indI = i; indJ = j-1;
	if(indJ >= 0 && gridArr[indI][indJ].hasBomb){
		bombs++;
	}
	indI = i+1; indJ = j;
	if(indI < FIELD_SIZE && gridArr[indI][indJ].hasBomb){
		bombs++;
	}
	indI = i-1; indJ = j;
	if(indI >= 0 && gridArr[indI][indJ].hasBomb){
		bombs++;
	}

	return bombs;
}
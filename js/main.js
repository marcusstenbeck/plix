define([
	'plix/PlixApp'
], function(
	PlixApp
) {
	var game = new PlixApp();
	game.DEBUG = true;

	var init = function() {

		var s = game.createScene('main');
			
		// TODO:
		// I want to be able to create an
		// entity with a parameter object


		// We're doing a square board
		var boardSize = 8;
		var boardSizeSquared = boardSize * boardSize;
		var boardTop = 16;
		var boardLeft = boardTop;

		// Instead of a two-dimensional array we'll go with
		// one longer array instead
		var board = new Array(boardSizeSquared);

		// Fill the array with random numbers 0-2
		for(var i = 0; i < boardSizeSquared; i++) {
			board[i] = Math.floor(3 * Math.random());
		}


		// Tile size (in pixels)
		var tileSize = 32;
		var tileTypes = {
			SQUARE: 0,
			CIRCLE: 1,
			TRIANGLE: 2
		};

		// Create board entities
		var boardTileEntities = new Array(boardSizeSquared);
		for (var i = boardTileEntities.length - 1; i >= 0; i--) {
			var e = s.createEntity();
			
			e.data.tileType = board[i];
			
			e.size.x = e.size.y = tileSize;
			e.transform.position.x = (i % boardSize) * tileSize + (e.size.x / 2) + boardTop;
			e.transform.position.y = Math.floor(i / boardSize) * tileSize + (e.size.y / 2) + boardLeft;

			var color = [1,0,1,1];
			if(e.data.tileType == tileTypes.SQUARE) {
				color = [1,0,0,1];
			} else if(e.data.tileType == tileTypes.CIRCLE) {
				color = [0,1,0,1];
			} else if(e.data.tileType == tileTypes.TRIANGLE) {
				color = [0,0,1,1];
			}
			e.component('graphics').graphic.color = color;

			boardTileEntities[i] = e;
		};


		// // Create paddle 1
		// var e = s.createEntity();
		// e.transform.position.x = 100;
		// e.transform.position.y = game.height - 50;
		// e.size.x = 100;
		// e.size.y = 10;
		
		// e.component('fsm')
		// .createState('default')
		// .onEnter(function(ent) {
		// 	var game = ent.scene.app;

		// 	ent.script = function() {
		// 		if(game.input.keyboard.A) ent.transform.position.x -= 5;
		// 		if(game.input.keyboard.S) ent.transform.position.x += 5;

		// 		var halfWidth = ent.size.x/2;
		// 		var leftEdge = ent.transform.position.x + halfWidth;
		// 		var rightEdge = ent.transform.position.x - halfWidth;
		// 		if(leftEdge >= game.width) ent.transform.position.x = game.width - halfWidth;
		// 		if(rightEdge <= 0) ent.transform.position.x = halfWidth;
		// 	};
		// });
		// // TODO: It's dumb to have to require this if we only add one state...
		// e.component('fsm').enterState('default');

		/**
		 * Run game
		 */
		game.start();
	};

	init();
});
define([
	'plix/CanvasRenderer',
	'plix/Scene',
	'plix/Util'
], function(
	Renderer,
	Scene,
	Util
) {
	'use strict';

	function PlixApp() {
		this.canvas = document.getElementById('game');

		this.renderer = new Renderer({
			canvas: this.canvas
		});

		this.running = false;

    	this.tpf = 0;
    	this.timeElapsed = 0;

    	this.scenes = [];

		this._init();
	}

	PlixApp.prototype._init = function() {
		var app = this;
		app.input = {
			mouse: { x:0, y:0, leftButton: false },
			keyboard: {}
		};

		// Track mouse position
		this.canvas.addEventListener('mousemove', function(e) {
			app.input.mouse.x = e.offsetX;
			app.input.mouse.y = e.offsetY;
		});

		// Track mouse click state
		this.canvas.addEventListener('mousedown', function(/*e*/) {
			app.input.mouse.leftButton = true;
		});
		this.canvas.addEventListener('mouseup', function(/*e*/) {
			app.input.mouse.leftButton = false;
		});

		var key;
		// Listen to keydown
		document.addEventListener('keydown', function(e) {

			key = Util.keyForCode(e.keyCode);

			// Set the key to true if it was pressed
			if(key) app.input.keyboard[key] = true;
			else console.warn('Uncaught key code', e.keyCode);

			// Send the event to the current scene
			app.scenes[app.scenes.length - 1].broadcastMessage('keydown:' + key);
		});

		// Listen to keyup
		document.addEventListener('keyup', function(e) {

			key = Util.keyForCode(e.keyCode);

			// Set key to false when it's not pressed anymore
			if(key) app.input.keyboard[key] = false;
			else console.warn('Uncaught key code', e.keyCode);

			// Send the event to the current scene
			app.scenes[app.scenes.length - 1].broadcastMessage('keyup:' + key);
		});

		// Set app dimensions
		app.width = app.canvas.width;
		app.height = app.canvas.height;
	};

	PlixApp.prototype.pushScene = function(scene) {
    	this.scenes.push(scene);
    	scene.app = this;
    };

    PlixApp.prototype.popScene = function(scene) {
    	this.scenes.pop();
    };

	PlixApp.prototype.runWithScene = function(scene) {		
		this.pushScene(scene);
		this._run();
	};

	PlixApp.prototype._run = function() {
		if(!this.running) this.running = true;
		window.requestAnimationFrame( this.update.bind(this) );
	};

    PlixApp.prototype.update = function(time) {
    	// Update time
		this.tpf = time - this.timeElapsed;
        this.timeElapsed = time;

        if(this.scenes.length) {
        	// Top scene in the stack
        	var scene = this.scenes[this.scenes.length -1];

			scene.update(scene.app.tpf);
			this.renderer.render(scene);
        }

        // Keep the loop going
        if(this.running) {
        	window.requestAnimationFrame( this.update.bind(this) );
        }
    };

    return PlixApp;
});
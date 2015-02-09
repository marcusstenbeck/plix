define([
	'plix/FsmComponent',
	'plix/Scene',
	'plix/Util'
], function(
	FsmComponent,
	Scene,
	Util
) {
	'use strict';

	function PlixApp() {
		this.canvas = document.getElementById('game');
		this.ctx = this.canvas.getContext('2d');

    	this.tpf = 0;
    	this.timeElapsed = 0;

    	this.scenes = [];

		this._init();
	}

	PlixApp.prototype._init = function() {
		var app = this;
		app.input = {
			mouse: { x:0, y:0 },
			keyboard: {}
		};

		// Track mouse position
		this.canvas.addEventListener('mousemove', function(e) {
			app.input.mouse.x = e.offsetX;
			app.input.mouse.y = e.offsetY;
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

	PlixApp.prototype.start = function() {		
		window.requestAnimationFrame( this.update.bind(this) );
	};

    PlixApp.prototype.update = function(time) {
    	// Update time
		this.tpf = time - this.timeElapsed;
        this.timeElapsed = time;

        // Wipe the canvas clean
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // For each scene in the stack
        this.scenes.forEach(function(scene) {
        	scene.update(scene.app.tpf);
        	scene.render(scene.app.ctx);
        });

        // Keep the loop going
        window.requestAnimationFrame( this.update.bind(this) );
    };

    PlixApp.prototype.createScene = function() {
    	var s = new Scene();
    	this.attachScene(s);
    	return s;
    };

    PlixApp.prototype.attachScene = function(scene) {
    	this.scenes.push(scene);
    	scene.app = this;
    };

    return PlixApp;
});
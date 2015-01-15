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
		this.state = 'ready';
		this.tiles = 0;

		this.canvas = document.getElementById('game');
		this.ctx = this.canvas.getContext('2d');

    	this.tpf = 0;
    	this.timeElapsed = 0;

    	this.scenes = [];

		this._init();
	}

	PlixApp.prototype._init = function() {
		var that = this;
		that.input = {
			mouse: { x:0, y:0 },
			keyboard: {}
		};

		// Track mouse position
		this.canvas.addEventListener('mousemove', function(e) {
			that.input.mouse.x = e.offsetX;
			that.input.mouse.y = e.offsetY;
		});

		var key;
		// Listen to keydown
		document.addEventListener('keydown', function(e) {

			key = Util.keyForCode(e.keyCode);

			// Set the key to true if it was pressed
			if(key) that.input.keyboard[key] = true;
			else console.warn('Uncaught key code', e.keyCode);
		});

		// Listen to keyup
		document.addEventListener('keyup', function(e) {

			key = Util.keyForCode(e.keyCode);

			// Set key to false when it's not pressed anymore
			if(key) that.input.keyboard[key] = false;
			else console.warn('Uncaught key code', e.keyCode);
		});

		// Set app dimensions
		this.width = this.canvas.width;
		this.height = this.canvas.height;
	};

	PlixApp.prototype.start = function() {
		// If game is already running, then return
		if(this.state == 'running') return;

		this.state = 'running';
		
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
        	scene.draw(scene.app.ctx);
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
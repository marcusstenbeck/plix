define([
	'plix/FsmComponent'
], function(
	FsmComponent
) {

	function PlixApp() {
		this.state = 'ready';
		this.tiles = 0;

		this.canvas = document.getElementById('game');
		this.ctx = this.canvas.getContext('2d');

    	this.tpf = 0;
    	this.timeElapsed = 0;

    	this.layers = [];

    	this.DEBUG = false;

		this._init();
	}

	PlixApp.prototype._init = function() {
		// Track mouse position
		var that = this;
		this.canvas.addEventListener('mousemove', function(e) {
			that.input.mouse.x = e.offsetX;
			that.input.mouse.y = e.offsetY;
		});

		// Listen to keydown
		document.addEventListener('keydown', function(e) {

			var key = false;

			switch(e.keyCode) {
				case 37:
					key = 'LEFT';
					break;
				case 65:
					key = 'A';
					break;
				case 38:
					key = 'UP';
					break;
				case 39:
					key = 'RIGHT';
					break;
				case 68:
					key = 'D';
					break;
				case 40:
					key = 'DOWN';
					break;
				case 32:
					key = 'SPACE';
					break;
				case 87:
					key = 'W';
					break;
				case 83:
					key = 'S';
					break;
				default:
					console.warn('Uncaught key code', e.keyCode);
			}

			// Set the key to true if it was pressed
			if(key) that.input.keyboard[key] = true;
		});

		// Listen to keyup
		document.addEventListener('keyup', function(e) {

			var key = false;

			switch(e.keyCode) {
				case 37:
					key = 'LEFT';
					break;
				case 65:
					key = 'A';
					break;
				case 38:
					key = 'UP';
					break;
				case 39:
					key = 'RIGHT';
					break;
				case 68:
					key = 'D';
					break;
				case 40:
					key = 'DOWN';
					break;
				case 32:
					key = 'SPACE';
					break;
				case 87:
					key = 'W';
					break;
				case 83:
					key = 'S';
					break;
				default:
					console.warn('Uncaught key code', e.keyCode);
			}

			// Set key to false when it's not pressed anymore
			if(key) that.input.keyboard[key] = false;
		});
	};

	PlixApp.prototype.start = function() {
		// If game is already running, then return
		if(this.state == 'running') return;

		this.state = 'running';
		
		window.requestAnimationFrame( this.update.bind(this) );
	};

    PlixApp.prototype.update = function(time) {
		this.tpf = time - this.timeElapsed;
        this.timeElapsed = time;


        window.requestAnimationFrame( this.update.bind(this) );

        // Wipe the canvas clean
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if(this.state == 'running') {

			if(this.DEBUG) {
				var ent = null;

				for(var i = 0; i < this.layers.length; i++) {
					this.ctx.strokeStyle = this.layers[i].active ? 'magenta' : 'grey';

					for(var j = 0; j < this.layers[i].entities.length; j++) {
						ent = this.layers[i].entities[j];
						
						this.ctx.moveTo(ent.transform.position.x - 2, ent.transform.position.y - 2);
						this.ctx.lineTo(ent.transform.position.x + 2, ent.transform.position.y + 2);
						this.ctx.moveTo(ent.transform.position.x + 2, ent.transform.position.y - 2);
						this.ctx.lineTo(ent.transform.position.x - 2, ent.transform.position.y + 2);

						this.ctx.stroke();

						this.ctx.strokeRect(ent.transform.position.x - ent.size.width/2,
											ent.transform.position.y - ent.size.height/2,
											ent.size.width,
											ent.size.height);
					}
				}
			}
        }
    };

    PlixApp.prototype.createLayer = function() {
    	var l = new Layer();
    	this.attachLayer(l);
    	return l;
    };

    PlixApp.prototype.attachLayer = function(layer) {
    	this.layers.push(layer);
    };

    PlixApp.prototype.end = function() {
		this.state = 'lose';
    };

    return PlixApp;
});
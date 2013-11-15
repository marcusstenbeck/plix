define([
	'plix/Scene'
], function(
	Scene
) {

	function Runner() {
		this.state = 'ready';
		this.tiles = 0;

		this.canvas = document.getElementById('game');
		this.ctx = this.canvas.getContext('2d');

		this.scene = new Scene();

		this._init();
	}

	Runner.prototype._init = function() {
		// Track mouse position
		var that = this;
		this.canvas.addEventListener('mousemove', function(e) {
			that.scene.mouse.x = e.offsetX;
			that.scene.mouse.y = e.offsetY;
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
			if(key) that.scene.input.keyboard[key] = true;
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
			if(key) that.scene.input.keyboard[key] = false;
		});
	};

	Runner.prototype.start = function() {
		// If game is already running, then return
		if(this.state == 'running') return;

		this.state = 'running';

		this.scene.width = this.canvas.width;
		this.scene.height = this.canvas.height;
		
		window.requestAnimationFrame( this.update.bind(this) );
	};

    Runner.prototype.update = function(time) {
		this.scene.tpf = time - this.scene.time;
        this.scene.time = time;


        window.requestAnimationFrame( this.update.bind(this) );

        // Wipe the canvas clean
        this.ctx.clearRect(0, 0, this.scene.width, this.scene.height);
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillRect(0, 0, this.scene.width, this.scene.height);

        if(this.state == 'running') {
            for(var i = 0; i < this.scene.entities.length; i++) {
                var entity = this.scene.entities[i];

                // ScriptComponent
                var scriptComponent = entity.components.scriptComponent;
                scriptComponent.run(this.scene.tpf);



                // PhysicsComponent
                var physicsComponent = entity.components.physicsComponent;

                if(physicsComponent) {
                    // Increment physics
                    physicsComponent.body.position.x += physicsComponent.body.velocity.x;
                    physicsComponent.body.position.y += physicsComponent.body.velocity.y;

                    // Copy the position to the entity
                    entity.position = physicsComponent.body.position;
                }





                // GraphicsComponent
                var graphicsComponent = entity.components.graphicsComponent;

                var graphicType = graphicsComponent.graphic.type;
                if(graphicType == 'shape') {
                    this.ctx.fillStyle = 'rgba(' +
                        graphicsComponent.graphic.color[0] * 255 + ', ' +
                        graphicsComponent.graphic.color[1] * 255 + ', ' +
                        graphicsComponent.graphic.color[2] * 255 + ', ' +
                        graphicsComponent.graphic.color[3] * 255 + ')';

                    // Entity position is centroid
                    this.ctx.fillRect(
                        parseInt(entity.position.x - graphicsComponent.graphic.shapeData.width / 2),
                        parseInt(entity.position.y - graphicsComponent.graphic.shapeData.height / 2),
                        graphicsComponent.graphic.shapeData.width,
                        graphicsComponent.graphic.shapeData.height);
                } else if(graphicType == 'sprite') {

                    // Entity position is centroid
                    this.ctx.drawImage(
                        graphicsComponent.graphic.spriteData,
                        parseInt(entity.position.x - graphicsComponent.graphic.spriteData.width / 2),
                        parseInt(entity.position.y - graphicsComponent.graphic.spriteData.height / 2)
                    );
                }
            }
        }
    };

    Runner.prototype.end = function() {
		this.state = 'lose';
    };

    return Runner;
});
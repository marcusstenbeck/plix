define([
], function(
) {

	function Scene(options) {
		this.width = 320;
		this.height = 240;

		this.entities = [];

		this.mouse = {
			x: 0,
			y: 0
		};

		this.input = {
			mouse: {},
            keyboard: {}
		};

		this.time = 0;
		this.tpf = 0;
	}

	Scene.prototype.getEntityByType = function(type) {
		for(var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].type == type) return this.entities[i];
		}
		return null;
	};

    return Scene;
});
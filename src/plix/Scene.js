define([
	'plix/Entity'
], function(
	Entity
) {
	'use strict';

	function Scene() {
		this.entities = [];
		this.active = true;

		this.app = null;
	}

	Scene.prototype.getEntityByType = function(type) {
		for(var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].type == type) return this.entities[i];
		}
		return null;
	};

	Scene.prototype.createEntity = function() {
		var ent = new Entity();
		ent.attachToScene(this);
		return ent;
	};

	Scene.prototype.attachEntity = function(ent) {
		this.entities.push(ent);
		return this;
	};

    return Scene;
});
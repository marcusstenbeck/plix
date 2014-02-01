define([
	'plix/Entity'
], function(
	Entity
) {

	function Scene(options) {
		this.entities = [];
		this.active = true;
	}

	Scene.prototype.getEntityByType = function(type) {
		for(var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].type == type) return this.entities[i];
		}
		return null;
	};

	Scene.prototype.createEntity = function(factory) {
		var ent = new Entity();
		this.attachEntity(ent);
		return ent;
	};

	Scene.prototype.attachEntity = function(ent) {
		this.entities.push(ent);
		return this;
	};

    return Scene;
});
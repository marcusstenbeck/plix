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

	Scene.prototype.update = function(tpf) {
		if(this._physicsWorld) this._physicsWorld.update(tpf);
			
		this.entities.forEach(function(entity) {
			if(typeof entity.script === 'function') entity.script(entity);
			if(entity._components.physics) {
				entity.transform.position.x = entity._components.physics.body.pos.x;
				entity.transform.position.y = entity._components.physics.body.pos.y;
			}
		});
	};

	Scene.prototype.render = function(ctx) {

		this.entities.forEach(function(entity) {
			entity.render(ctx);
		});
	};

    return Scene;
});
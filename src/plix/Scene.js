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

	Scene.prototype.draw = function(ctx) {

		ctx.strokeStyle = this.active ? 'magenta' : 'grey';

		this.entities.forEach(function(ent) {

			// Get color from entity
			var color = ent.component('graphics').graphic.color;

			ctx.strokeStyle = 'rgba(' + (255 * color[0]) + ',' + (255 * color[1]) + ',' + (255 * color[2]) + ',' + (255 * color[3]) + ')';

			
			ctx.beginPath();
			ctx.moveTo(ent.transform.position.x - 2.5, ent.transform.position.y - 2.5);
			ctx.lineTo(ent.transform.position.x + 2.5, ent.transform.position.y + 2.5);
			ctx.moveTo(ent.transform.position.x + 2.5, ent.transform.position.y - 2.5);
			ctx.lineTo(ent.transform.position.x - 2.5, ent.transform.position.y + 2.5);

			ctx.stroke();

			ctx.strokeRect(ent.transform.position.x - ent.size.x/2 + 0.5,
								ent.transform.position.y - ent.size.y/2 + 0.5,
								ent.size.x - 1,
								ent.size.y - 1);
		});
	};

    return Scene;
});
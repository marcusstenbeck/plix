define([
	'plix/FsmComponent',
	'plix/GraphicsComponent',
	'plix/PhysicsComponent'
], function(
	FsmComponent,
	GraphicsComponent,
	PhysicsComponent
) {
	'use strict';
	
	return {
		fsm: FsmComponent,
		graphics: GraphicsComponent,
		physics: PhysicsComponent
	};
});
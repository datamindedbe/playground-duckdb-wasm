export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","inspector_duck.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.B-wx2Jm_.js","app":"_app/immutable/entry/app.CxGQmHuW.js","imports":["_app/immutable/entry/start.B-wx2Jm_.js","_app/immutable/chunks/entry.BX3vy92x.js","_app/immutable/chunks/scheduler.BWih1DpW.js","_app/immutable/entry/app.CxGQmHuW.js","_app/immutable/chunks/scheduler.BWih1DpW.js","_app/immutable/chunks/index.Cb7kfjIe.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();



export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.Dy8QNrp5.js","_app/immutable/chunks/scheduler.BWih1DpW.js","_app/immutable/chunks/index.Cb7kfjIe.js","_app/immutable/chunks/entry.BX3vy92x.js"];
export const stylesheets = [];
export const fonts = [];

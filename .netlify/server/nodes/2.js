

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.UcvvEUv6.js","_app/immutable/chunks/scheduler.BWih1DpW.js","_app/immutable/chunks/index.Cb7kfjIe.js"];
export const stylesheets = ["_app/immutable/assets/2.197A5vVr.css"];
export const fonts = [];

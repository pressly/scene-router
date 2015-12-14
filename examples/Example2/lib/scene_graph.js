

const sceneIdGen = (() => {
  let id = 0;
  return () => `scene:${id++}`;
}());

const sceneGraph = (Component, props, params, qs) => ({
  id: sceneIdGen(),
  Component,
  props,
  params,
  qs
});

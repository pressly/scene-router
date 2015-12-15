import route from 'trie-route';
import { idGen, isObjectEmpty } from './util';

const sceneIdGen = idGen('scene');

const sceneGraph = (sceneComponent, params = {}, qs = {}, props = {}) => ({
  id: sceneIdGen(),
  sceneComponent,
  params,
  qs,
  props
});

const sceneGraphBuilder = (scenes) => {
  const router = route.create();

  scenes.forEach((scene, index) => {
    const { component, path } = scene;

    router.path(path, (params, qs, context) => {
      context.payload = sceneGraph(component, params, qs);
      context.child = {};
      return context.child;
    });
  });

  return (path, props = {}) => {
    const sceneGraph = router.capture(path);

    if (isObjectEmpty(sceneGraph)) {
      throw new Error(`scene for path '${path}' not found.`);
    }

    //we need to assign the props to last child of scene graph.
    //in this way we can make sure that only target component will receive the props
    let lastChild = sceneGraph;
    while (!isObjectEmpty(lastChild.child)) {
      lastChild = lastChild.child;
    }
    //assign props to last child
    lastChild.payload.props = props;

    return lastChild.payload;
  };
};

module.exports = sceneGraphBuilder;

const route = require('trie-route');

const isObjectEmpty = (obj) => {
  return Object.getOwnPropertyNames(obj).length === 0;
}

//each element of this array must contain path and component fields.
const createSceneGraphBuilder = (scenes) => {
  //create an internal route
  const router = route.create();

  let internalMeta;
  let idCounter = 0;

  //construct route registray
  scenes.forEach((scene, index) => {
    const { component, path, flatten } = scene;
    const sceneName = `scene:${index}`;

    router.path(path, (params, queryStrings, context) => {
      context.meta = {
        ...internalMeta,
        flatten: flatten
      };

      context.payload = {
        id: `${sceneName}:${++idCounter}`,
        component: component,
        props: {},
        params: params,
        queryStrings: queryStrings
      };

      context.child = {};

      return context.child;
    });
  });

  return (path, props, meta) => {
    internalMeta = meta;
    const sceneGraph = router.capture(path);


    if (isObjectEmpty(sceneGraph)) {
      throw new Error(`scene for path '${path}' not found.`);
    }

    //we need to assign the props to last child of scene graph.
    //it this way we can make sure that only target component will receive the props
    let lastChild = sceneGraph;
    while (!isObjectEmpty(lastChild.child)) {
      lastChild = lastChild.child;
    }

    //assign props to last child
    lastChild.payload.props = props;

    return sceneGraph;
  }
};

module.exports = {
  builder: createSceneGraphBuilder
};

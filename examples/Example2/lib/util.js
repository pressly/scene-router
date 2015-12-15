import Vector2D from './vector2d';

export const idGen = (prefix = '') => {
  let id = 0;
  return () => `${prefix}:${id++}`;
};

export const wait = (delay) => {
  return new Promise((resolve, _) => {
    setTimeout(resolve, delay)
  });
};

export const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

export const getSceneAreaSize = (sceneObjects, window) => {
  let temp = new Vector2D();
  return sceneObjects.reduce((result, sceneObj) => {
    const { internalProps: { position } } = sceneObj;

    temp.assign(window.width, window.height);
    temp.add(position);

    if (result.x < temp.x) {
      result.x = temp.x;
    }

    if (result.y < temp.y) {
      result.y = temp.y;
    }

    return result;
  }, new Vector2D());
};

export const isObjectEmpty = (obj) => {
  return Object.getOwnPropertyNames(obj).length === 0;
};

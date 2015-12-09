import Vector2D from './vector2d';

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

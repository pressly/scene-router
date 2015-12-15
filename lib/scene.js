import React, { Component } from 'react-native';
import sceneGraphBuilder from './scene_graph';
import SceneSide from './scene_side';
import Camera from './camera';

const CAMERA_REF = 'CAM';

const _parseScenes = (children, scenes, parentPath) => {
  React.Children.forEach(children, (child) => {
    const { children, path, component } = child.props;
    const childPath = parentPath + '/' + path;

    scenes.push({
      path: childPath,
      component: component
    });

    _parseScenes(children, scenes, childPath);
  });
};

const parseScenes = (children) => {
  let scenes = [];
  _parseScenes(children, scenes, '');
  return scenes;
};

class Scene extends Component {
  constructor(props, context) {
    super(props, context);

    const scenes = parseScenes(props.children);
    this.sceneGraph = sceneGraphBuilder(scenes);
  }

  __findScene__(path, props) {
    //becasue camera only accept props and qs and params are part of props,
    //we are extracting them from sceneGraph and adding them to props.
    //NOTE: make `qs` and `params` keywords are taken and will be overridden.
    let sg = this.sceneGraph(path, props);
    sg.props.params = sg.params;
    sg.props.qs = sg.qs;

    delete sg.qs;
    delete sg.params;

    return sg;
  }

  goto(path, props, options = {}) {
    const camera = this.refs[CAMERA_REF];

    //we are making sure that oprions.withAnimation default is true
    if ('undefined' === typeof options.withAnimation) {
      options.withAnimation = true;
    }
    options.withAnimation = !!options.withAnimation;
    options.side = options.side || SceneSide.LEFT;

    sg = this.__findScene__(path, props, options);

    camera.pushScene(sg.sceneComponent,
                     sg.id,
                     sg.props,
                     options.side,
                     options.withAnimation);
  }

  goback() {
    const camera = this.refs[CAMERA_REF];
    camera.popScene();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {
      initialPath,
      initialProps
    } = this.props;

    //scene the initial scene can not be animated, withAnimation and side
    //have no effect. Camera component will override them into false and INITIAL
    let initialScene = this.__findScene__(initialPath, initialProps);

    return (
      <Camera
        ref={CAMERA_REF}
        initialScene={initialScene}
      />
    );
  }
}

module.exports = Scene;

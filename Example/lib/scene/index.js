const React = require('react-native');
const SceneManager = require('../scene_manager');

const {
  Component
} = React;

const _parseScenes = (children, arr, parentPath) => {
  React.Children.forEach(children, (child) => {
    const { children, path, component, flatten } = child.props;
    const childPath = parentPath + '/' + path;

    arr.push({
      path: childPath,
      component: component,
      flatten: flatten
    });

    _parseScenes(children, arr, childPath);
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

    this.state = {
      scenes: parseScenes(props.children)
    };
  }

  goto() {

  }

  goback() {

  }

  render() {
    const {
      initialPath,
      initialProps,
      camera
    } = this.props;

    const {
      scenes
    } = this.state;

    return (
      <SceneManager
        initialPath={initialPath}
        initialProps={initialProps}
        camera={camera}
        scenes={scenes}/>
    );
  }
}

Scene.propTypes = {
  //first child props only
  initialPath: React.PropTypes.string,
  initialProps: React.PropTypes.object,
  camera: React.PropTypes.func,

  //children only props
  path: React.PropTypes.string,
  component: React.PropTypes.func,
  flatten: React.PropTypes.bool
};

Scene.defaultProps = {
  flatten: true
};

module.exports = Scene;

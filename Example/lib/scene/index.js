const React = require('react-native');

const {
  Component
} = React;

const parseScenes = (children, arr, parentPath) => {
  React.Children.forEach(children, (child) => {
    const { children, path, component, flatten } = child.props;
    const childPath = parentPath + '/' + path;

    arr.push({
      path: childPath,
      component: component,
      flatten: flatten
    });

    parseScenes(children, arr, childPath);
  });
};

class Scene extends Component {
  constructor(baseProps, context) {
    super(baseProps, context);

    const { initialPath, initialProps, children } = baseProps;

    let scenes = [];
    parseScenes(children, scenes, '');

    this.state = {
      initialPath: initialPath,
      initialProps: initialProps,
      scenes: scenes
    };
  }

  goto() {

  }

  goback() {

  }

  render() {
    const { camera } = this.props;

    const {
      initialPath,
      initialProps,
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
  camera: React.PropTypes.func

  //children only props
  path: React.PropTypes.string,
  component: React.PropTypes.func,
  flatten: React.PropTypes.bool
};

Scene.defaultProps = {
  flatten: true
};

const React = require('react-native');
const route = require('trie-route');
const sceneWrapper = require('./sceneWrapper');
const SceneManager = require('./sceneManager');

const {
  Component
} = React;

function parseScenes(children, arr, parentPath) {
  React.Children.forEach(children, (child) => {
    const { children, path, component, loadingComponent } = child.props;
    const childPath = parentPath + '/' + path;

    arr.push({
      path: childPath,
      component: sceneWrapper(loadingComponent)(component)
    });

    parseScenes(children, arr, childPath);
  });
}

class Scene extends Component {
  constructor(baseProps) {
    super(baseProps);
    this.router = route.create();

    const { initialScenePath, children, props } = baseProps;

    if (!initialScenePath) {
      throw new Error('Root Scene must have initialScenePath prop');
    }

    let scenes = [];
    parseScenes(children, scenes, '');

    this.initialScene = null;
    scenes.forEach((scene) => {
      this.router.path(scene.path, (params) => {
        if (!this.initialScene) {
          this.initialScene = {
            component: scene.component,
            params: params,
            props: props
          };
        } else {

        }
      });
    });

    this.router.process(initialScenePath);
  }

  render() {
    if (!this.initialScene) {
      throw new Error('initialScenePath not found');
    }

    return (
      <SceneManager
        ref="sceneManager"
        initialScene={this.initialScene}/>
    );
  }
}

Scene.propTypes = {
  initialScenePath: React.PropTypes.string,
  path: React.PropTypes.string,
  component: React.PropTypes.func,
  loadingComponent: React.PropTypes.func
};

module.exports = Scene;

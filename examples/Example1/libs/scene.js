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

    this.nextOptions = {};

    this.initialScene = null;
    scenes.forEach((scene) => {
      this.router.path(scene.path, (params, queryStrings) => {
        if (!this.initialScene) {
          this.initialScene = {
            component: scene.component,
            params: params,
            queryStrings: queryStrings,
            props: props
          };
        } else {
          this.refs.sceneManager.push(this.nextOptions.side || 'right',
                                      !!this.nextOptions.withAnimation,
                                      scene.component,
                                      this.nextOptions.props || {},
                                      params,
                                      queryStrings);
          this.nextOptions = {};
        }
      });
    });

    this.router.process(initialScenePath);
  }

  //options => props, side, withAnimation
  goto(path, options={}) {
    this.nextOptions = options;
    this.router.process(path);
  }

  goback() {
    const { sceneManager } = this.refs;
    sceneManager.pop();
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

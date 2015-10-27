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

    this.initialSceneGraph = {};

    scenes.forEach((scene, index) => {
      //this is a uninqe id for every scene.
      const sceneId = `scene:${index}`;

      this.router.path(scene.path, (params, queryStrings, context) => {

        //if this.nextOptions is null, it means that this route is a child of
        //another node.
        if (this.nextOptions) {
          //setup some internal variables
          context.side = this.nextOptions.side || 'right';
          context.withAnimation = !!this.nextOptions.withAnimation;
          context.props = this.nextOptions.props || {};
          context.replace = !!this.nextOptions.replace;
        }

        //we need this to detect which scene is rendered currently.
        //so we don't do animation if only props, params and/or queryStrings of the same scene change.
        context.sceneId = sceneId;

        //setup component and params
        context.component = scene.component;
        context.params = params;
        context.queryStrings = queryStrings;
        context.child = {};

        //reset nextOptions
        //since the rest of scenes are going to be included as child,
        //we don't need the options any more
        this.nextOptions = null;

        //return the empty child so the next route can populate the child context
        return context.child;
      });
    });

    this.initialSceneGraph = this._createSceneGraph(initialScenePath);
    if (!this.initialSceneGraph) {
      throw new Error(`scene with path '${initialScenePath}' not found`);
    }
  }

  _createSceneGraph(path) {
    return this.router.capture(path);
  }

  _renderScenes(path) {
    const { sceneManager } = this.refs;
    const sceneGraph = this._createSceneGraph(path);

    if (!sceneGraph) {
      throw new Error(`scene with path '${path}' not found`);
    }

    //push the obj which contains all the information required for SceneManager
    //to render and display the content.
    sceneManager.push(sceneGraph);
  }

  //options => props, side, withAnimation, passPropsToChild
  goto(path, options={}) {
    //set the options and call the render.
    this.nextOptions = options;
    this._renderScenes(path);
  }

  goback() {
    const { sceneManager } = this.refs;
    sceneManager.pop();
  }

  render() {
    if (!this.initialSceneGraph) {
      throw new Error('initialScenePath not found');
    }

    return (
      <SceneManager
        ref="sceneManager"
        initialSceneGraph={this.initialSceneGraph}/>
    );
  }
}

Scene.propTypes = {
  //this prop only uses for root scene, it will be ignored for any other scene
  initialScenePath: React.PropTypes.string,
  //the rest of props are only use in child scenes and they are ignored in root scene
  path: React.PropTypes.string,
  component: React.PropTypes.func,
  loadingComponent: React.PropTypes.func
};

module.exports = Scene;

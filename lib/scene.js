const React = require('react-native');
const route = require('trie-route');
const sceneWrapper = require('./sceneWrapper');
const SceneManager = require('./sceneManager');

const {
  Component
} = React;

function parseScenes(children, arr, parentPath) {
  React.Children.forEach(children, (child) => {
    const { children, path, component, loadingComponent, flatten } = child.props;
    const childPath = parentPath + '/' + path;

    arr.push({
      path: childPath,
      component: sceneWrapper(loadingComponent)(component),
      flatten: flatten
    });

    parseScenes(children, arr, childPath);
  });
}

function isChildEmpty(child) {
  return Object.getOwnPropertyNames(child).length === 0;
}

class Scene extends Component {
  constructor(baseProps) {
    super(baseProps);
    this.router = route.create();

    const { initialPath, children, props } = baseProps;

    if (!initialPath) {
      throw new Error('Root Scene must have initialPath prop');
    }

    let scenes = [];
    parseScenes(children, scenes, '');

    this.nextOptions = {};

    this.initialSceneGraph = {};

    scenes.forEach((scene, index) => {
      //this is a uninqe id for every scene.
      const sceneId = `scene:${index}`;

      this.router.path(scene.path, (params, queryStrings, context) => {

        //setup some internal variables
        context.side = this.nextOptions.side || 'right';
        context.withAnimation = !!this.nextOptions.withAnimation;
        context.props = this.nextOptions.props || {};
        context.replace = !!this.nextOptions.replace;

        //we need this to detect which scene is rendered currently.
        //so we don't do animation if only props, params and/or queryStrings of the same scene change.
        context.sceneId = sceneId;

        //setup component and params
        context.component = scene.component;
        context.params = params;
        context.queryStrings = queryStrings;
        context.child = {};
        context.flatten = scene.flatten;

        //return the empty child so the next route can populate the child context
        return context.child;
      });
    });

    this.initialSceneGraph = this._createSceneGraph(initialPath);
    if (!this.initialSceneGraph) {
      throw new Error(`scene with path '${initialPath}' not found`);
    }
  }

  _createSceneGraph(path) {
    return this.router.capture(path);
  }

  _renderScenes(path) {
    const { sceneManager } = this.refs;
    let sceneGraph = this._createSceneGraph(path);

    //need to find the one that has a flatten as false.
    while (sceneGraph.flatten) {
      //it means that we are only intrested of rendering parent
      if (isChildEmpty(sceneGraph.child)) {
        sceneGraph.renderThis = true;
        break;
      }

      sceneGraph = sceneGraph.child;
    }

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
      throw new Error('initialPath not found');
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
  initialPath: React.PropTypes.string,
  //the rest of props are only use in child scenes and they are ignored in root scene
  path: React.PropTypes.string,
  component: React.PropTypes.func,
  loadingComponent: React.PropTypes.func,
  //flatten will be only apply to children not grand children.
  flatten: React.PropTypes.bool
};

Scene.defaultProps = {
  flatten: false
};

module.exports = Scene;

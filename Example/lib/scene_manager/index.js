const React = require('react-native');
const Cameras = require('../cameras');
const InternalMath = require('../math');
const sceneGraph = require('../scene_graph');
const wrapComponent = require('./wrap_component');

const {
  StyleSheet,
  Component,
  Animated,
  Dimensions
} = React;

const {
  Vector2D
} = InternalMath;

const window = Dimensions.get('window');
const createSceneGraph = sceneGraph.builder;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const CAMERA_REF = 'CAMERA_REF';

const STATUS_IDEL = 'idel';
const STATUS_REQUEST_POP = 'pop';
const STATUS_REQUEST_PUSH = 'push';

const isObjectEmpty = (obj) => {
  return Object.getOwnPropertyNames(obj).length === 0;
}

/**
 * calculate the right position for next camera location
 * @param side {String} the side which needs to start the animation from
 * @param x {Number} current x position of camera
 * @param y {Number} current y position of camera
 * @return {Object} contains x and y of next position
 */
const calculateAnimationPosition = (side, x, y) => {
  const { width, height } = window;

  switch (side) {
    case 'left':
      x = x - width;
      break;
    case 'right':
      x = x + width;
      break;
    case 'top':
      y = y - height;
      break;
    case 'bottom':
      y = y + height;
      break;
    default:
      throw new Error(`side '${side}' is not defined`);
  }

  return { x, y };
};

class SceneManager extends Component {
  constructor(props) {
    super(props);

    const { initialPath, initialProps } = props;
    //initial configuration
    const initialMeta = {
      withAnimation: false,
      position: { x: 0, y: 0 }
    };

    const wrapScenes = props.scenes.map((scene) => {
      scene.component = wrapComponent(scene.component);
      return scene;
    });

    this._buildSceneGraph = createSceneGraph(wrapScenes);

    const initialSceneGraph = this._buildSceneGraph(initialPath, initialProps, initialMeta);

    this._currentScene = initialSceneGraph;
    this._prevScene = null;

    this.state = {
      status: STATUS_REQUEST_PUSH,
      shouldCallLifeCycle: true,
      duration: 400,
      cameraPosition: new Vector2D(0, 0),
      sceneGraphs: [initialSceneGraph]
    };
  }

  _clearHistory() {
    this.state.sceneGraphs = [this.currentScene];
    this.setState(this.state);
  }

  _sceneDidMount(ref) {
    if (!this._currentScene.refs) {
      this._currentScene.refs = [];
    }

    this._currentScene.refs.push(ref);

    //call life cycle on both current and prev scenes

    //current scene
    ref.willFocus();

    //prev scene
    //we need this condition because initial scene does not have a prev scene.
    if (this._prevScene && this._prevScene.refs) {
      this._prevScene.refs.forEach((ref) => {
        ref.willBlur();
      });
    }
  }

  _sceneWillUnmount(ref) {

  }

  _buildSceneFromSceneGraph(sceneGraph) {
    if (isObjectEmpty(sceneGraph)) {
      return null;
    }

    const { meta, payload, child } = sceneGraph;
    const Component = payload.component;

    let renderedScene;

    //we are checking if path is flatten and it has at least a child.
    //now if you trying to get into the actuall path, this prevent the null component.
    if (meta.flatten && !isObjectEmpty(child)) {
      renderedScene = this._buildSceneFromSceneGraph(child);
    } else {
      renderedScene = (
        <Component
          key={payload.id}
          wrappedProps={{
            position: meta.position,
            sceneDidMount: this._sceneDidMount.bind(this),
            sceneWillUnmount: this._sceneWillUnmount.bind(this),
          }}
          sceneProps={{
            params: payload.params,
            queryStrings: payload.queryStrings || {},
            ...payload.props
          }}>
          {this._buildSceneFromSceneGraph(child)}
        </Component>
      );
    }

    return renderedScene;
  }

  _onCameraTransitionStart() {

  }

  _onCameraTransitionEnd() {
    //we need this to remove an item from sceneGraph which causes componentWillUnmount
    const { status } = this.state;

    switch (this.state.status) {
      case STATUS_REQUEST_POP:
        this.state.status = STATUS_IDEL;
        //since this happens when item is poped out, we don't want to get a callback anymore
        this.state.shouldCallLifeCycle = false;

        this.state.sceneGraphs.pop();
        this.setState(this.state);
        break;
      case STATUS_REQUEST_PUSH:
        //we need to start calling on didFocus and didBlur
        if (this._prevScene && this._prevScene.refs) {
          this._prevScene.refs.forEach((ref) => {
            ref.didBlur();
          });
        }

        if (this._currentScene.refs) {
          this._currentScene.refs.forEach((ref) => {
            ref.didFocus();
          });
        }

        this.state.status = STATUS_IDEL;
        //since this happens when item is poped out, we don't want to get a callback anymore
        this.state.shouldCallLifeCycle = false;
        this.setState(this.state);
        break;
      default:
        //do nothing
    }
  }

  /*
   * push new scene based on path and options to scene manager state
   * @param path {String} route to specific scene
   * @param props {Object} props to be sent to component
   * @param options {Object} contains { withAnimation: Boolean, side: String, clearHistory: Boolean, replace: Boolean }
   */
  push(path, props, options) {
    const { cameraPosition } = this.state;

    //build up meta properties from options
    let meta = {
      withAnimation: true,
      side: 'right',
      clearHistory: false,
      replace: false,
      ...options,
    };

    //if you are replacing current scene with new scene, animation needs to be false
    if (meta.repalce) {
      meta.withAnimation = false;
      meta.position = { x: cameraPosition.x, y: cameraPosition.y };
    }

    if (meta.withAnimation) {
      meta.position = calculateAnimationPosition(meta.side, cameraPosition.x, cameraPosition.y);
    }

    //removes unused fields
    delete meta.side;

    const sceneGraph = this._buildSceneGraph(path, props, meta);

    this._prevScene = this._currentScene;
    this._currentScene = sceneGraph;

    this.state.sceneGraphs.push(sceneGraph);
    this.state.cameraPosition.assign(meta.position.x, meta.position.y);
    this.state.shouldCallLifeCycle = true;
    this.state.status = STATUS_REQUEST_PUSH;

    this.setState(this.state);
  }

  pop() {
    if (this.state.sceneGraphs.length < 2) {
      console.log('nothing to pop');
      return;
    }

    //we need to set camera position to prev scene
    this.state.cameraPosition.assign(this._prevScene.meta.position.x, this._prevScene.meta.position.y);

    //we can call WillFocus and WillBlue here

    this.state.status = STATUS_REQUEST_POP;
    this.state.shouldCallLifeCycle = true;

    this.setState(this.state);
  }

  render() {
    const Camera = this.props.camera;
    const { shouldCallLifeCycle, duration, cameraPosition, sceneGraphs } = this.state;

    const scenes = this.state.sceneGraphs.map((sceneGraph) => {
      return this._buildSceneFromSceneGraph(sceneGraph);
    });

    return (
      <Camera
        ref={CAMERA_REF}
        x={cameraPosition.x}
        y={cameraPosition.y}
        duration={duration}
        scenes={scenes}
        shouldCallLifeCycle={shouldCallLifeCycle}
        onSceneTransitionStart={this._onCameraTransitionStart.bind(this)}
        onSceneTransitionEnd={this._onCameraTransitionEnd.bind(this)}/>
    )
  }
}

SceneManager.propTypes = {
  initialPath: React.PropTypes.string,
  initialProps: React.PropTypes.string,
  scenes: React.PropTypes.arrayOf(
    React.PropTypes.shape(
      {
        path: React.PropTypes.string.isRequired,
        component: React.PropTypes.func.isRequired,
        flatten: React.PropTypes.bool.isRequired
      }
    )
  ).isRequired,
  camera: React.PropTypes.func
};

SceneManager.defaultProps = {
  camera: Cameras.Base
};

module.exports = SceneManager;

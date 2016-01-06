import React, {
  Component,
  Animated,
  View,
  StyleSheet,
  Dimensions
} from 'react-native';

import * as util from './util';
import Vector2D from './vector2d';
import SceneSide from './scene_side';

const window = Dimensions.get('window');

const SCENE_REF = 'SCENE_REF';

//Todo: we should clean this function. it must delay calling resolve
//resolve can return promise which needs to be sent back to caller.
//I don't know whether this approach is correct or not.
const delayCall = async (resolve) => {
  await util.wait(20);
  return resolve();
};

class Scene extends Component {
  constructor(props, context) {
    super(props, context);
  }

  _getSceneRef() {
    const sceneRef = this.refs[SCENE_REF];
    if (sceneRef && sceneRef.getWrappedInstance) {
      return sceneRef.getWrappedInstance();
    }

    return sceneRef;
  }

  _callMethod(name) {
    const scene = this._getSceneRef();
    if (scene && scene[name]) {
      scene[name]();
    }
  }

  willBlur() {
    this._callMethod('sceneWillBlur');
  }

  didBlur() {
    this._callMethod('sceneDidBlur');
  }

  willFocus() {
    this._callMethod('sceneWillFocus');
  }

  didFocus() {
    this._callMethod('sceneDidFocus');
  }

  componentDidMount() {
    const {
      internalProps: { startTransition }
    } = this.props;
    startTransition();
  }

  render() {
    const {
      id,
      SceneComponent,
      props,
      internalProps: {
        position
      }
    } = this.props;

    return (
      <View style={[styles.view, { top: position.y, left: position.x }]}>
        <SceneComponent ref={SCENE_REF} id={id} {...props}/>
      </View>
    );
  }
}

class Camera extends Component {
  constructor(props, context) {
    super(props, context);

    //this variable used to hold camera position. this variable should
    //only be changed by `move` method
    this._position = new Animated.ValueXY({ x: 0, y: 0 });

    //we need this varibale because overflow: 'hidden' will be applied to all
    //scenes in android and it can not be changed.
    this._sceneArea = new Vector2D(window.width, window.height);

    this._ready = false; //this variable is used to make sure that we are
                         //not animating until Camera component is mounted
    const { initialScene } = props;
    const initialSceneObj = this._buildSceneObj(initialScene.id,
                                                initialScene.sceneComponent,
                                                initialScene.props,
                                                SceneSide.INITIAL,
                                                false,
                                                initialScene.actualPath)

    //holds all the sceneObjects.
    this.state = {
      scenes: [initialSceneObj]
    };
  }

  //this method is only for information about what goes into scenes array for
  //documantation.
  _makeSceneObj(id, SceneComponent, props, internalProps) {
    return {
      id,
      SceneComponent, //on purpose I made this to be Uppercase to make life easer during render
      props,
      internalProps //this variable must be create by _makeInternalProps method
    };
  }

  _makeInternalProps(side, position, startTransition, withAnimation, path, duration) {
    return {
      //store the side
      side,
      position, //position: {x, y} which holds scene position in scene area
      //will be called by SceneWrapper once the component is mounted to tell camera
      //that it's a good time to move from current scene to new scene.
      startTransition,
      withAnimation: !!withAnimation,
      path,
      duration // duration of transition
    };
  }

  //get current location of camera. since mutltiple methods require camera postion,
  //it is reasonable to put it into its own method.
  _getCameraPosition() {
    const { x, y } = this._position;
    return new Vector2D(x.__getValue(), y.__getValue());
  }

  //heler method to return next camera position or an empty spot
  _findSidePosition(side) {
    const { x, y } = this._getCameraPosition().reverse();
    const { width, height } = window;
    const { LEFT, RIGHT, TOP, BOTTOM, INITIAL } = SceneSide;

    let result = new Vector2D();

    switch (side) {
      case LEFT:
        result.x = x + width;
        result.y = y;
        break;

      case RIGHT:
        result.x = x - width;
        result.y = y;
        break;

      case TOP:
        result.x = x;
        result.y = y + height;
        break;

      case BOTTOM:
        result.x = x;
        result.y = y - height;
        break;

      case INITIAL:
        break;

      default:
        throw new Error(`undefined side type '${side}'`);
    }

    return result;
  }

  //when we popScene, we need to revert the animation.
  //this method is a helper to covnert and reverse the side.
  _reverseSide(side) {
    const { LEFT, RIGHT, TOP, BOTTOM } = SceneSide;
    switch (side) {
      case LEFT:
        return RIGHT;

      case RIGHT:
        return LEFT;

      case TOP:
        return BOTTOM;

      case BOTTOM:
        return TOP;

      default:
        throw new Error(`type '${side}' is not defined`);
    }
  }

  _move(side, withAnimation, duration) {
    return new Promise((resolve, reject) => {
      //this only happens during initialScene. since initial scene has no animation
      //we will resolve it rigth away.
      if (!this._ready) {
        resolve();
        return;
      }

      const nextCameraPosition = this._findSidePosition(side);
      nextCameraPosition.reverse();

      if (withAnimation) {
        Animated.timing(this._position, {
          duration,
          toValue: nextCameraPosition
        }).start(resolve);
      } else {
        this._position.setValue(nextCameraPosition);
        delayCall(resolve);
      }
    });
  }

  _renderScenes() {
    const { scenes } = this.state;
    return scenes.map((sceneObj) =>

      //adding id to ref, so we can find it and call the lifecyle methods
      <Scene
        key={sceneObj.id}
        ref={sceneObj.id}
        {...sceneObj}/>
    );
  }

  _buildSceneObj(id, sceneComponent, props, side, withAnimation, path, duration) {
    const nextScenePosition = this._findSidePosition(side);
    const startTransition = async () => {
      try {
        await util.wait(100);

        const currentScene = this._getCurrentScene();
        const prevScene = this._getPrevScene();

        if (prevScene) {
          this.refs[prevScene.id].willBlur();
        }
        this.refs[currentScene.id].willFocus();
        await this._move(side, withAnimation, duration)
        this.refs[currentScene.id].didFocus();
        if (prevScene) {
          this.refs[prevScene.id].didBlur();
        }
      } catch(e) {
        console.log(e);
      }
    };

    const internalProps = this._makeInternalProps(side, nextScenePosition, startTransition, withAnimation, path, duration);
    const sceneObj = this._makeSceneObj(id, sceneComponent, props, internalProps);

    return sceneObj;
  }

  _getCurrentScene() {
    const { scenes } = this.state;
    const length = scenes.length;
    return scenes[length - 1];
  }

  _getPrevScene() {
    const { scenes } = this.state;
    const length = scenes.length;
    if (length < 2) {
      return null;
    }
    return scenes[length - 2];
  }

  //we need this in Scene component to call onSceneChange with position value
  getSceneStack() {
    return this.state.scenes;
  }

  pushScene(sceneComponent, id, props, side, withAnimation = true, reset = false, path, duration = 2000) {
    if (side == SceneSide.RIGHT || side == SceneSide.BOTTOM) {
      throw new Error(`Animating to '${side}' is not supported`);
    }
    const sceneObj = this._buildSceneObj(id,
                                         sceneComponent,
                                         props,
                                         side,
                                         withAnimation,
                                         path,
                                         duration);

    if (reset) {
      const currentScene = this._getCurrentScene();
      this.refs[currentScene.id].willBlur();
      this.refs[currentScene.id].didBlur();
      this.state.scenes = [sceneObj];
    } else {
      this.state.scenes.push(sceneObj);
    }

    this._sceneArea = util.getSceneAreaSize(this.state.scenes, window);
    this.setState(this.state);
  }

  async popScene() {
    const { scenes } = this.state;
    if (scenes.length <= 1 ) {
      //nothing to pop;
      return;
    }

    const currentScene = this._getCurrentScene();
    const nextScene = this._getPrevScene();

    const { internalProps } = currentScene;

    this.refs[currentScene.id].willBlur();
    this.refs[nextScene.id].willFocus();

    //we need to make sure that animation has been done before removing previous
    //scene from scenes array.
    await this._move(this._reverseSide(internalProps.side), internalProps.withAnimation, internalProps.duration);

    this.refs[currentScene.id].didBlur();
    this.refs[nextScene.id].didFocus();

    //removing previous scene from senecs array
    this.state.scenes.pop();
    this.setState(this.state);
  }

  componentDidMount() {
    this._ready = true;
  }

  render() {
    const cameraStyle = {
      width: this._sceneArea.x,
      height: this._sceneArea.y,
      transform: this._position.getTranslateTransform()
    };

    return(
      <Animated.View
        style={[styles.view, cameraStyle]}>
          { this._renderScenes() }
      </Animated.View>
    );
  }
}

Camera.propTypes = {
  initialScene: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    sceneComponent: React.PropTypes.func.isRequired,
    props: React.PropTypes.object.isRequired
  }).isRequired,
  duration: React.PropTypes.string
};

const styles = StyleSheet.create({
  view: {
    overflow: 'hidden',
    position: 'absolute',
    width: window.width,
    height: window.height
  },
});

export default Camera;

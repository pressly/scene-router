import React, {
  Component,
  Animated,
  View,
  StyleSheet,
  Dimensions
} from 'react-native';

import * as util from './util';
import Vector2D from './vector2d';

const window = Dimensions.get('window');

const makeScene = (sceneObj) => {
  class SceneWrapper extends Component {
    constructor(props, context) {
      super(props, context);
    }

    componentDidMount() {
      const {
        internalProps: { startTransition }
      } = sceneObj;

      //TODO: it is a good idea to pass the ref to this function
      //so camera can start calling the scene life cyles.
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
      } = sceneObj;

      return (
        <View style={[styles.view, { top: position.y, left: position.x }]}>
          <SceneComponent id={id} {...props}/>
        </View>
      );
    }
  }

  //adding more info for debugging purposes.
  const component = sceneObj.SceneComponent;
  SceneWrapper.displayName = `Scene(${util.getDisplayName(sceneObj.SceneComponent)})`;

  return SceneWrapper;
};

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
                                                Camera.AnimatedTo.INITIAL,
                                                false)

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

  _makeInternalProps(side, position, startTransition, withAnimation) {
    return {
      //store the side
      side,
      position, //position: {x, y} which holds scene position in scene area
      //will be called by SceneWrapper once the component is mounted to tell camera
      //that it's a good time to move from current scene to new scene.
      startTransition,
      withAnimation: !!withAnimation
    };
  }

  //get current location of camera. since mutltiple methods require camera postion,
  //it is reasonable to put it into its own method.
  _getCameraPosition() {
    const { x, y } = this._position;
    return {
      x: x.__getValue(),
      y: y.__getValue()
    };
  }

  //heler method to return next camera position or an empty spot
  _findSidePosition(side) {
    const { x, y } = this._getCameraPosition();
    const { width, height } = window;
    const { LEFT, RIGHT, TOP, BOTTOM, INITIAL } = Camera.AnimatedTo;

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

  _move(side, withAnimation) {
    if (!this._ready) return;
    const nextCameraPosition = this._findSidePosition(side);
    nextCameraPosition.reverse();
    if (withAnimation) {
      Animated.timing(this._position, {
        duration: 2000,
        toValue: nextCameraPosition
      }).start()
    } else {
      this._position.setValue(nextCameraPosition);
    }
  }

  _renderScenes() {
    const { scenes } = this.state;

    return scenes.map((sceneObj) => {
      const SceneComponent = makeScene(sceneObj);
      return (
        <SceneComponent
          key={sceneObj.id} />
      );
    });
  }

  _buildSceneObj(id, sceneComponent, props, side, withAnimation) {
    const nextScenePosition = this._findSidePosition(side);
    const startTransition = () => this._move(side, withAnimation);
    const internalProps = this._makeInternalProps(side, nextScenePosition, startTransition, withAnimation);
    const sceneObj = this._makeSceneObj(id, sceneComponent, props, internalProps);

    return sceneObj;
  }

  addScene(sceneComponent, id, props, side, withAnimation = true) {
    const sceneObj = this._buildSceneObj(id,
                                         sceneComponent,
                                         props,
                                         side,
                                         withAnimation);

    this.state.scenes.push(sceneObj);
    this._sceneArea = util.getSceneAreaSize(this.state.scenes, window);
    this.setState(this.state);
  }

  componentDidMount() {
    this._ready = true;
  }

  render() {
    return(
      <Animated.View
        style={[styles.view, { width: this._sceneArea.x, height: this._sceneArea.y, transform: this._position.getTranslateTransform() }]}>
          { this._renderScenes() }
      </Animated.View>
    );
  }
}

//Animated to. for example, LEFT means animate the scene to Left. <-x
Camera.AnimatedTo = {
  LEFT:    0,
  RIGHT:   1, //not supported
  TOP:     2,
  BOTTOM:  3, //not supported
  INITIAL: 4,
};

Camera.propTypes = {
  initialScene: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    sceneComponent: React.PropTypes.func.isRequired,
    props: React.PropTypes.object.isRequired
  }).isRequired
}

const styles = StyleSheet.create({
  view: {
    overflow: 'hidden',
    position: 'absolute',
    width: window.width,
    height: window.height
  },
});

export default Camera;

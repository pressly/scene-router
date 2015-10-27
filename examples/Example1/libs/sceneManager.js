const React = require('react-native');

const {
  StyleSheet,
  Component,
  Animated,
  Dimensions,
  View
} = React;

const window = Dimensions.get('window');

const genId = (() => {
  let counter = 0;
  return () => {
    return ++counter;
  };
}());

const styles = StyleSheet.create({
  camera: {
    position: 'absolute',
    backgroundColor: 'transparent'
  }
});

/*
  scene object contains
    id: unique number
    position: { x, y }
    component: react component
    props any object
    params
    queryStrings
 */

class SceneManager extends Component {
  constructor(props) {
    super(props);

    const { initialSceneGraph } = props;

    this.cameraPosition = new Animated.ValueXY();

    this.current = {
      x: 0,
      y: 0
    };

    this.prevScene = null;
    this.currentScene = {
      sceneId: initialSceneGraph.sceneId,
      id: genId(),
      position: { x: this.current.x, y: this.current.y },
      component: initialSceneGraph.component,
      props: initialSceneGraph.props || {},
      params: initialSceneGraph.params || {},
      queryStrings: initialSceneGraph.queryStrings || {},
      withAnimation: false
    };

    this.state = {
      scenes: [this.currentScene]
    };
  }

  //this method modifies this.current object to proper value based on side selection.
  _findEmptyPosition(side) {
    const { width, height } = window;
    let current = this.current;

    switch(side) {
      case 'left':
        current.x = current.x - width;
        break;
      case 'right':
        current.x = current.x + width;
        break;
      case 'top':
        current.y = current.y - height;
        break;
      case 'bottom':
        current.y = current.y + height;
        break;
      default:
        throw new Error(side + ' is not defined');
    }
  }

  _moveCameraWithoutAnimationTo(x, y) {
    //we need this for now because, Animated.View can't find the setNativeProps
    //still don't know why. one possible problem might be related to component has not be mounted yet
    setTimeout(() => {
      this.cameraPosition.setValue({x: -x, y: -y});
    }, 0);
  }

  _moveCameraWithAnimationTo(x, y, done) {
    Animated.timing(this.cameraPosition, {
      duration: 400,
      toValue: { x: -x, y: -y }
    }).start((value) => {
      done();
    });
  }

  _findSceneIndexById(id) {
    let foundIndex = -1;
    this.state.scenes.some((scene, index) => {
      if (scene.id === id) {
        foundIndex = index;
        return true;
      }
      return false;
    });
    return foundIndex;
  }

  _callWillFocus(refs) {
    refs.forEach((ref) => {
      ref.willFocus();
    });
  }

  _callDidFocus(refs) {
    refs.forEach((ref) => {
      ref.didFocus();
    });
  }

  _callWillBlur(refs) {
    refs.forEach((ref) => {
      ref.willBlur();
    });
  }

  _callDidBlur(refs) {
    refs.forEach((ref) => {
      ref.didBlur();
    });
  }

  /**
   * id           {number}    unique number
   * startRender  {function}  uses inside scene wrapper to use LoadingComponent
   */
  _sceneDidMount(ref, startRender, isChild) {
    //since the scene is mouned, but the camera hasn't moved yet,
    //we can call on willFocus to let the component know that you will be focus soon.
    //make sure that you don't do expensive operations here. this is only good for
    //setting up flags and trigger async calls.
    if (!this.currentScene.refs) {
      this.currentScene.refs = [];
    }

    this.currentScene.refs.push(ref);

    ref.willFocus();

    if (this.currentScene.withAnimation) {
      //with the animation, first we are animating the scene and once the animation is done,
      //we are rendering the content of the scene.
      this._moveCameraWithAnimationTo(this.currentScene.position.x, this.currentScene.position.y, () => {
        if (this.prevScene) {
          this._callDidBlur(this.prevScene.refs);
        }
        startRender();
        ref.didFocus();
      });
    } else {
      this._moveCameraWithoutAnimationTo(this.currentScene.position.x, this.currentScene.position.y);
      if (this.prevScene) {
        this._callDidBlur(this.prevScene.refs);
      }
      startRender();
      ref.didFocus();
    }
  }

  _sceneWillUnmount(id) {
    const index = this._findSceneIndexById(id);
  }

  buildSceneFromSceneGraph(sceneGraph) {
    //this condition terminates recursive calls to this method
    //the second condition is that child might be just a plain object {}.
    //we need to make sure that if there is no component attach to it, return null;
    if (!sceneGraph || !sceneGraph.component) {
      return null;
    }

    const CurrentComponent = sceneGraph.component;
    const params = sceneGraph.params;
    const queryStrings = sceneGraph.queryStrings;

    //props only available for the first child. subsequent children won't
    //get the props.
    let props = sceneGraph.props || {};

    //adding id and key for the top component only
    //it will prevent component from thrown an error in scene map method
    if (sceneGraph.id) {
      props.id = sceneGraph.id;
      props.key = sceneGraph.id
      props.position = sceneGraph.position;
      props.isChild = false;
    } else {
      props.isChild = true;
    }

    //TODO: we need to make sure that these props can be safe
    props.sceneDidMount = this._sceneDidMount.bind(this);
    props.sceneWillUnmount = this._sceneWillUnmount.bind(this);

    const value = (
      <CurrentComponent
        params={params}
        queryStrings={queryStrings}
        {...props}>
        {this.buildSceneFromSceneGraph(sceneGraph.child)}
      </CurrentComponent>
    );

    return value;
  }

  //when this method calls, it means that camera has already moved to
  //previous scene. So what this method do is calling didFocus on prevScene,
  //which now becomes currentScene and pop the scenes stack and set the previous scene
  //to one item before previous scene. At the end it will call setState.
  _popScene() {
    this._callDidFocus(this.prevScene.refs);

    //currentScene will become prevScene
    this.currentScene = this.prevScene;
    this.state.scenes.splice(this.state.scenes.length -1 , 1);

    if (this.state.scenes.length < 2) {
      this.prevScene = null;
    } else {
      this.prevScene = this.state.scenes[this.state.scenes.length - 2];
    }

    this.setState(this.state);
  }

  //push(side, withAnimation, component, props={}, params={}, queryStrings={}) {
  push(sceneGraph) {
    let { scenes } = this.state;

    //we need to call wiilBlur which tells the component that you will be soon
    //out of focus and some other scene will replace you.
    //this is a good start if you want to locked scene for no furthur changes.
    if (this.currentScene) {
      this._callWillBlur(this.currentScene.refs);
    }

    this.prevScene = this.currentScene;

    this._findEmptyPosition(sceneGraph.side);

    sceneGraph.id = genId();
    sceneGraph.position = { x: this.current.x, y: this.current.y };

    this.currentScene = sceneGraph;

    //pushing new scene to scenes stack. remmeber, this scene has not been
    //rendered yet. It will be rendered once _sceneDidMount is called.
    this.state.scenes.push(this.currentScene);

    //we are passing the new scene to state.
    //it will be rendered and _sceneDidMount will be called.
    //if withAnimation is set to true, the animation will be taking care of.
    this.setState(this.state);
  }

  pop() {
    //if scenes stack has only one element, there is no point to call pop.
    if (this.state.scenes.length < 2) {
      return;
    }

    //we need to call willBlur on currentScene
    this._callWillBlur(this.currentScene.refs);

    //we also need to call willFocus on previous scene
    this._callWillFocus(this.prevScene.refs);

    //we need to see whether currentScene has animated or not
    if (this.currentScene.withAnimation) {
      this._callDidBlur(this.currentScene.refs);

      this._moveCameraWithAnimationTo(this.prevScene.position.x, this.prevScene.position.y, () => {
        this._popScene();
      });
    } else {
      this._callDidBlur(this.currentScene.refs);

      this._moveCameraWithoutAnimationTo(this.prevScene.position.x, this.prevScene.position.y);
      this._popScene();
    }
  }

  render() {
    const scenes = this.state.scenes.map((scene) => {
      const Component = scene.component;

      //otherwise, we need to return the component.
      return this.buildSceneFromSceneGraph(scene);
    });

    return (
      <Animated.View style={[styles.camera, {transform: this.cameraPosition.getTranslateTransform()}]}>
        {scenes}
      </Animated.View>
    );
  }
}

SceneManager.propTypes = {
  initialSceneGraph: React.PropTypes.object.isRequired
};

module.exports = SceneManager;

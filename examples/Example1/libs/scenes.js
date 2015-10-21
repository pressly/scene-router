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
    queryStrings,
    rendered
 */

class Scenes extends Component {
  constructor(props) {
    super(props);

    const { initalScene } = props;

    this.cameraPosition = new Animated.ValueXY();

    this.current = {
      x: 0,
      y: 0
    };

    this.prevScene = null;
    this.currentScene = {
      id: genId(),
      position: { x: this.current.x, y: this.current.y },
      component: initalScene.component,
      props: initalScene.props || {},
      params: initalScene.params || {},
      queryString: initalScene.queryString || {},
      withAnimation: false,
      rendered: null
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
    console.log(x, y);
    //we need this for now because, Animated.View can find the setNativeProps
    //still don't know why. it might be related to component has not be mounted yet
    setTimeout(() => {
      this.cameraPosition.setValue({x: x, y: y});
    }, 0);
  }

  _moveCameraWithAnimationTo(x, y, done) {
    console.log(x, y);
    Animated.timing(this.cameraPosition, {
      duration: 300,
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

  /**
   * id           {number}    unique number
   * startRender  {function}  uses inside scene wrapper to use LoadingComponent
   */
  _sceneDidMount(ref, startRender) {
    //since the scene is mouned, but the camera hasn't moved yet,
    //we can call on willFocus to let the component know that you will be focus soon.
    //make sure that you don't do expensive operations here. this is only good for
    //setting up flags and trigger async calls.
    this.currentScene.ref = ref;
    ref.willFocus();

    if (this.currentScene.withAnimation) {
      //with the animation, first we are animating the scene and once the animation is done,
      //we are rendering the content of the scene.
      this._moveCameraWithAnimationTo(this.currentScene.position.x, this.currentScene.position.y, () => {
        if (this.prevScene) {
          this.prevScene.ref.didBlur();
        }
        startRender();
        ref.didFocus();
      });
    } else {
      this._moveCameraWithoutAnimationTo(this.currentScene.position.x, this.currentScene.position.y);
      if (this.prevScene) {
        this.prevScene.ref.didBlur();
      }
      startRender();
      ref.didFocus();
    }
  }

  _sceneWillUnmount(id) {
    const index = this._findSceneIndexById(id);
    this.state.scenes.splice(index, 1);
    this.setState(this.state);
  }

  //when this method calls, it means that camera has already moved to
  //previous scene. So what this method do is calling didFocus on prevScene,
  //which now becomes currentScene and pop the scenes stack and set the previous scene
  //to one item before previous scene. At the end it will call setState.
  _popScene() {
    this.prevScene.ref.didFocus();
    //currentScene will become prevScene
    this.currentScene = this.prevScene;
    this.state.scenes.pop();
    if (this.state.scenes.length < 2) {
      this.prevScene = null;
    } else {
      this.prevScene = this.state.scenes[this.state.scenes.length - 2];
    }

    this.setState(this.state);
  }

  push(side, withAnimation, component, props={}, params={}, queryString={}) {
    let { scenes } = this.state;

    //we need to call wiilBlur which tells the component that you will be soon
    //out of focus and some other scene will replace you.
    //this is a good start if you want to locked scene for no furthur changes.
    if (this.currentScene) {
      this.currentScene.ref.willBlur();
    }

    this.prevScene = this.currentScene;

    this._findEmptyPosition(side);
    this.currentScene = {
      id: genId(),
      position: { x: this.current.x, y: this.current.y },
      component: component,
      props: props,
      params: params,
      queryString: queryString,
      withAnimation: withAnimation,
      rendered: null
    };

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
    this.currentScene.ref.willBlur();
    //we also need to call willFocus on previous scene
    this.prevScene.ref.willFocus();

    //we need to see whether currentScene has animated or not
    if (this.currentScene.withAnimation) {
      this.currentScene.ref.didBlur();
      this._moveCameraWithAnimationTo(this.prevScene.position.x, this.prevScene.position.y, () => {
        this._popScene();
      });
    } else {
      this.currentScene.ref.didBlur();
      this._moveCameraWithoutAnimationTo(this.prevScene.position.x, this.prevScene.position.y);
      this._popScene();
    }
  }

  render() {
    const scenes = this.state.scenes.map((scene) => {
      const Component = scene.component;

      //if scene is already rendered, return it.
      if (scene.rendered) {
        return scene.rendered;
      }

      //otherwise, we need to return the component.
      scene.rendered = (
        <Component
          id={scene.id}
          sceneDidMount={this._sceneDidMount.bind(this)}
          sceneWillUnmount={this._sceneWillUnmount.bind(this)}
          position={scene.position}
          key={scene.id}
          params={scene.params}
          queryStrings={scene.queryStrings}
          {...scene.props}/>
      );

      return scene.rendered;
    });

    //, {transform: this.cameraPosition.getTranslateTransform()}
    return (
      <Animated.View style={[styles.camera, {transform: this.cameraPosition.getTranslateTransform()}]}>
        {scenes}
      </Animated.View>
    );
  }
}

Scenes.propTypes = {
  initalScene: React.PropTypes.shape({
    component: React.PropTypes.func.isRequired,
    props: React.PropTypes.object,
    params: React.PropTypes.object,
    queryStrings: React.PropTypes.object
  }).isRequired
};

module.exports = Scenes;

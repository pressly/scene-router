const React = require('react-native');
const Glass = require('./glass');

const {
  StyleSheet,
  Component,
  Animated,
  View
} = React;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: window.height,
    backgroundColor: 'transparent'
  }
});

class Camera extends Component {
  constructor(props, context) {
    super(props, context);

    this._position = new Animated.ValueXY();
  }

  //move camera to x, y coordinate, if duration is 0, it moved it right away with no animation.
  //returns a promise
  _moveCamera(x, y, duration) {
    return new Promise((resolve, reject) => {
      const toValue = { x: -x, y: -y };

      //it means that you don't want to animate to that scene
      if (duration <= 0) {
        this._position.setValue(toValue);
        resolve();
      } else {
        Animated.timing(this._position, {
          toValue: toValue,
          duration: duration
        }).start(resolve);
      }
    });
  }

  async _sceneTransition() {
    const { x, y, duration, onSceneTransitionStart, onSceneTransitionEnd } = this.props;
    onSceneTransitionStart();
    try {
      await this._moveCamera(x, y, duration);
      onSceneTransitionEnd();
    } catch (e) {
      console.log('something went wrong during transition');
      console.log(e);
    }
  }

  renderBack() {
    return null;
  }

  renderScenes(scenes) {
    //return React.Children.map(scenes, (scene) => <View key={scene.id}>{scene}</View>)
    return scenes;
  }

  renderGlass() {
    return <Glass/>;
  }

  render() {
    const { scenes } = this.props;

    return (
      <View style={styles.container}>
        {this.renderBack()}
        <Animated.View style={[styles.camera, { transform: this._position.getTranslateTransform() }]}>
          {this.renderScenes(scenes)}
        </Animated.View>
        {this.renderGlass()}
      </View>
    );
  }

  componentDidMount() {
    const { onSceneTransitionStart, onSceneTransitionEnd } = this.props;
    onSceneTransitionStart();
    onSceneTransitionEnd();
  }

  componentDidUpdate() {
    if (this.props.shouldCallLifeCycle) {
      this._sceneTransition();
    }
  }
}

Camera.propTypes = {
  scenes: React.PropTypes.arrayOf(React.PropTypes.node),
  x: React.PropTypes.number,
  y: React.PropTypes.number,
  duration: React.PropTypes.number,
  onSceneTransitionStart: React.PropTypes.func,
  onSceneTransitionEnd: React.PropTypes.func,
  shouldCallLifeCycle: React.PropTypes.bool
};

Camera.defaultProps = {
  scenes: [],
  x: 0,
  y: 0,
  duration: 400,
  onSceneTransitionStart: () => {},
  onSceneTransitionEnd: () => {},
  shouldCallLifeCycle: true
};

module.exports = Camera;

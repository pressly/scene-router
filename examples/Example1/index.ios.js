/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

const React = require('react-native');
const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Component,
  Animated,
  Dimensions
} = React;

const window = Dimensions.get('window');

//TODO: we need to add an unique id to each scene
//it is better to use scene's name. it has to be done during add the scene

class Scene extends Component {
  constructor(props) {
    super(props);
  }

  render() {

  }
}

Scene.propTypes = {
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired
}

class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scenes: []
    };
  }

  addScene(name, element) {
    this.state.scenes.push({
      name,
      element
    });

    this.setState(this.state);
  }

  findScene(name) {
    let foundScene = null;

    this.state.scenes.some((scene) => {
      if (scene.name === name) {
        foundScene = scene;
        return true;
      }
      return false;
    });

    return foundScene;
  }

  render() {
    return (
      <View style={styles.cameraContainer}>
        {this.state.scenes.map((scene) => scene.element)}
      </View>
    );
  }
}


class Example1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.view1}/>
        <View style={styles.view2}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cameraContainer: {
    position: 'absolute',
    backgroundColor: 'transparent'
  },
  container: {
    position: 'absolute',
    //top: 0,
    //left: 0,
    //width: window.width * 2,
    //height: window.height,
    backgroundColor: 'transparent',
    transform: [{ translateY: 0 }, { translateX: -300 }]
  },
  view1: {
    position: 'absolute',
    width: window.width,
    height: window.height,

    top: 0,
    left: 0,
    backgroundColor: 'blue'
  },

  view2: {
    position: 'absolute',
    width: window.width,
    height: window.height,

    top: 0,
    left: window.width,
    backgroundColor: 'yellow'
  }
});

AppRegistry.registerComponent('Example1', () => Example1);

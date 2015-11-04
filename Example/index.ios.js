/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Component
} = React;

var window = Dimensions.get('window');

class MyCamera extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.camera}>
        <View style={styles.child1}/>
        <View style={styles.child2}/>
        <View style={{ transform: [{ translateX: -700 }, { translateY: 0}] }}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

var MyCameraAnimated = Animated.createAnimatedComponent(MyCamera);

class Scene1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.scene, { top: 0, left: 0, backgroundColor: 'black' }]}/>
    );
  }
}

class Scene2 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.scene, { top: 0, left: window.width, backgroundColor: 'blue' }]}/>
    );
  }
}

var Example = React.createClass({
  render: function() {
    return (
      <MyCamera>
        <Scene1/>
        <Scene2/>
      </MyCamera>
    );
  }
});

var styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  scene: {
    position: 'absolute',
    width: window.width,
    height: window.height
  },
  child1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    backgroundColor: 'red',
    width: window.width,
    height: window.height
  },
  child2: {
    position: 'absolute',
    top: 0,
    left: 100,
    backgroundColor: 'yellow',
    width: window.width,
    height: window.height
  }
});

AppRegistry.registerComponent('Example', () => Example);

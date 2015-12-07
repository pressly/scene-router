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

import Camera from './lib/camera';


class Example2 extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs.camera.addScene(Scene, "2", { color: 'blue' }, Camera.Sides.RIGHT, true);
    }, 2000);
  }

  render() {
    return (
      <Camera ref="camera" initialScene={{
          id: "1",
          sceneComponent: Scene,
          props: {
            color: 'red'
          }
        }}/>
    );
  }
}

class Scene extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { color } = this.props;
    return (
      <View style={[styles.view, { backgroundColor: color }]}>
        <Text style={{top: 20 }} onPress={()=>console.log('hello')}>Press Me</Text>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
    top:0,
    left: 0,
    right: 0,
    bottom: 0
  },
  view: {
    position: 'absolute',
    width: window.width,
    height: window.height
  }
});

AppRegistry.registerComponent('Example2', () => Example2);

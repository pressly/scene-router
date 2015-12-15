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

import { Scene, SceneSide } from './lib';

const wait = (delay) => {
  return new Promise((resolve, _) => {
    setTimeout(resolve, delay)
  });
};

class Example2 extends Component {
  constructor(props, context) {
    super(props, context);
  }

  async componentDidMount() {
    const scene = this.refs['scene'];
    await wait(3000);
    scene.goto("/scene/red");
    await wait(3000);
    scene.goto("/scene/yellow");
    await wait(3000);
    scene.goback();
    // await wait(3000);
    // this.refs.camera.popScene();
    // await wait(3000);
    // this.refs.camera.pushScene(Scene, "2", { color: 'blue' }, Camera.AnimatedTo.TOP, false);
    // await wait(3000);
    // this.refs.camera.popScene();
  }

  render() {
    return (
      <Scene ref="scene" initialPath="/scene/blue" initialProps={{}}>
        <Scene path="scene/:color" component={CustomScene}></Scene>
      </Scene>
    );
  }
}

class CustomScene extends Component {
  constructor(props, context) {
    super(props, context);
  }

  sceneWillFocus() {
    console.log(`scene with color '${this.props.color}' will focus.`);
  }

  sceneDidFocus() {
    console.log(`scene with color '${this.props.color}' did focus.`);
  }

  sceneWillBlur() {
    console.log(`scene with color '${this.props.color}' will blur.`);
  }

  sceneDidBlur() {
    console.log(`scene with color '${this.props.color}' did blur.`);
  }

  render() {
    const { params: { color } } = this.props;
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

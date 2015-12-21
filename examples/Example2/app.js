/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Component
} = React;

var window = Dimensions.get('window');

import { Scene, SceneSide } from 'scene-router';

const wait = (delay) => {
  return new Promise((resolve, _) => {
    setTimeout(resolve, delay)
  });
};

class App extends Component {
  constructor(props, context) {
    super(props, context);
  }

  async componentDidMount() {
    const scene = this.refs['scene'];
    await wait(3000);
    scene.goto("/scene/red", {}, { side: SceneSide.TOP });
    await wait(3000);
    scene.goto("/scene/yellow");
    await wait(3000);
    scene.goback();
    await wait(3000);
    scene.goback();
    await wait(3000);
    scene.goto("/scene/yellow", {}, { withAnimation: false });
    await wait(3000);
    scene.goback();
    await wait(3000);
    scene.goto("/scene/yellow", {});
    await wait(3000);
    scene.goto("/scene/red", {}, { reset: true });
    await wait(3000);
  }

  render() {
    return (
      <Scene ref="scene" initialPath="/scene/blue" initialProps={{}} onSceneChange={(event) => {
          console.log(event);
        }}>
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
    const { params: { color } } = this.props;
    console.log(`scene with color '${color}' will focus.`);
  }

  sceneDidFocus() {
    const { params: { color } } = this.props;
    console.log(`scene with color '${color}' did focus.`);
  }

  sceneWillBlur() {
    const { params: { color } } = this.props;
    console.log(`scene with color '${color}' will blur.`);
  }

  sceneDidBlur() {
    const { params: { color } } = this.props;
    console.log(`scene with color '${color}' did blur.`);
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

module.exports = App;

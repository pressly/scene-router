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

const { Scene, Scenes } = require('./libs');

class FirstScene extends Component {
  constructor(props) {
    super(props);
  }

  sceneWillFocus() {
    console.log('FirstScene sceneWillFocus');
  }

  sceneDidFocus() {
    console.log('FirstScene sceneDidFocus');
  }

  sceneWillBlur() {
    console.log('FirstScene sceneWillBlur');
  }

  sceneDidBlur() {
    console.log('FirstScene sceneDidBlur');
  }

  componentDidMount() {
    console.log('FirstScene componentDidMount');
  }

  componentWillUnmount() {
    console.log('FirstScene componentWillUnmount');
  }

  render() {
    return (
      <View ref="root" style={{ backgroundColor: 'red', flex: 1 }}></View>
    );
  }
}

class SecondScene extends Component {
  constructor(props) {
    super(props);
  }

  sceneWillFocus() {
    console.log('SecondScene sceneWillFocus');
  }

  sceneDidFocus() {
    console.log('SecondScene sceneDidFocus');
  }

  sceneWillBlur() {
    console.log('SecondScene sceneWillBlur');
  }

  sceneDidBlur() {
    console.log('SecondScene sceneDidBlur');
  }

  componentDidMount() {
    console.log('SecondScene componentDidMount');
  }

  componentWillUnmount() {
    console.log('SecondScene componentWillUnmount');
  }

  render() {
    return (
      <View ref="root" style={{ backgroundColor: 'yellow', flex: 1 }}></View>
    );
  }
}

class Example1 extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { scenes } = this.refs;
    setTimeout(() => {
      scenes.push('bottom', true, Scene()(SecondScene));
    }, 1000);

    setTimeout(() => {
      scenes.pop();
    }, 3000);
  }

  render() {
    return (
      <Scenes ref="scenes" initalScene={{ component: Scene()(FirstScene) }}/>
    );
  }
}

AppRegistry.registerComponent('Example1', () => Example1);

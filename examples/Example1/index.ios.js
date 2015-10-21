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
      scenes.push('left', true, Scene()(SecondScene));
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

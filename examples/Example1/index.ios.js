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

const Scene = require('./libs');

class FirstSceneLoading extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Text>First Scene Loading</Text>
    );
  }
}

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
      <View
        ref="root"
        style={{ backgroundColor: 'red', flex: 1 }}></View>
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
      <View
        ref="root"
        style={{ backgroundColor: 'yellow', flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}

class SecondInner extends Component {
  constructor(props) {
    super(props);
  }

  sceneWillFocus() {
    console.log('SecondInner sceneWillFocus');
  }

  sceneDidFocus() {
    console.log('SecondInner sceneDidFocus');
  }

  sceneWillBlur() {
    console.log('SecondInner sceneWillBlur');
  }

  sceneDidBlur() {
    console.log('SecondInner sceneDidBlur');
  }

  componentDidMount() {
    console.log('SecondInner componentDidMount');
  }

  componentWillUnmount() {
    console.log('SecondInner componentWillUnmount');
  }

  render() {
    return (
      <View style={{ backgroundColor: 'blue', opacity: 0.4, flex: 1 }}>

      </View>
    );
  }
}

class Example1 extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs.scene.goto('/second/inner?enableBack=true', { withAnimation: true });
      setTimeout(() => {
        this.refs.scene.goto('/second?enableBack=false', { replace: true });
        setTimeout(() => {
          this.refs.scene.goback();
        }, 2000)
      }, 2000);
    }, 3000);
  }

  render() {
    return (
      <Scene ref="scene" initialScenePath="/first/12?hello=12&bye=nice">
        <Scene path="first/:id" component={FirstScene}/>
        <Scene path="second" component={SecondScene}>
          <Scene path="inner" component={SecondInner}/>
        </Scene>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('Example1', () => Example1);

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

const Scene = require('scene-router');

async function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}


class Login extends Component {
  constructor(props) {
    super(props);
  }

  sceneWillFocus() {
    console.log('Login sceneWillFocus');
  }

  sceneDidFocus() {
    console.log('Login sceneDidFocus');
  }

  sceneWillBlur() {
    console.log('Login sceneWillBlur');
  }

  sceneDidBlur() {
    console.log('Login sceneDidBlur');
  }

  componentDidMount() {
    console.log('Login componentDidMount');
  }

  componentWillUnmount() {
    console.log('Login componentWillUnmount');
  }

  render() {
    return (
      <View
        ref="root"
        style={{ backgroundColor: 'red', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Login</Text>
      </View>
    );
  }
}

class Signup extends Component {
  constructor(props) {
    super(props);
  }

  sceneWillFocus() {
    console.log('Signup sceneWillFocus');
  }

  sceneDidFocus() {
    console.log('Signup sceneDidFocus');
  }

  sceneWillBlur() {
    console.log('Signup sceneWillBlur');
  }

  sceneDidBlur() {
    console.log('Signup sceneDidBlur');
  }

  componentDidMount() {
    console.log('Signup componentDidMount');
  }

  componentWillUnmount() {
    console.log('Signup componentWillUnmount');
  }

  render() {
    return (
      <View
        ref="root"
        style={{ backgroundColor: 'yellow', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Signup</Text>
        {this.props.children}
      </View>
    );
  }
}

class Intro extends Component {
  constructor(props) {
    super(props);
  }

  sceneWillFocus() {
    console.log('Intro sceneWillFocus');
  }

  sceneDidFocus() {
    console.log('Intro sceneDidFocus');
  }

  sceneWillBlur() {
    console.log('Intro sceneWillBlur');
  }

  sceneDidBlur() {
    console.log('Intro sceneDidBlur');
  }

  componentDidMount() {
    console.log('Intro componentDidMount');
  }

  componentWillUnmount() {
    console.log('Intro componentWillUnmount');
  }

  render() {
    return (
      <View style={{ backgroundColor: 'blue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Intro</Text>
      </View>
    );
  }
}

class Example1 extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    try {
      await wait(2000);
      this.refs.scene.goto('/sign-up1', { side:'right', withAnimation: true });
      await wait(2000);
      this.refs.scene.goto('/login', { side:'right', withAnimation: true });
      await wait(2000);
      this.refs.scene.goback();
    } catch(e) {
      console.log(e);
    }
  }

  _onError(message) {
    console.log(message);
  }

  render() {
    return (
      <Scene ref="scene" initialPath="/sign-up/intro" onPathNotMatched={this._onError}>
        <Scene path="login" component={Login}></Scene>
        <Scene path="sign-up" component={Signup} flatten={true}>
          <Scene path="intro" component={Intro}/>
        </Scene>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('Example1', () => Example1);

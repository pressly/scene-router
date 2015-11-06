const React = require('react-native');
const SceneRouter = require('./lib');

const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Component,
  Dimensions
} = React;

const {
  Scene,
  Cameras
} = SceneRouter;

const window = Dimensions.get('window');
const openLeftMenuOffset = window.width * 2 / 3;
const openRightMenuOffset = -openLeftMenuOffset;

function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

class LeftMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, width: window.width, height: window.height, backgroundColor: 'brown' }}/>
    );
  }
}

class RightMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, width: window.width, height: window.height, backgroundColor: 'black' }}/>
    );
  }
}

class Home extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    console.log('Home is mounted');
  }

  sceneWillFocus() {
    console.log('Home will be focused');
  }

  sceneDidFocus() {
    console.log('Home did focuse');
  }

  sceneWillBlur() {
    console.log('Home will be Blured');
  }

  sceneDidBlur() {
    console.log('Home did Blur');
  }

  componentWillUnmount() {
    console.log('Home will be unmounted');
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'red' }}></View>
    );
  }
}

class About extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    console.log('About is mounted');
  }

  sceneWillFocus() {
    console.log('About will be focused');
  }

  sceneWillBlur() {
    console.log('About will be Blured');
  }

  sceneDidBlur() {
    console.log('About did Blur');
  }

  sceneDidFocus() {
    console.log('About did focuse');
  }

  componentWillUnmount() {
    console.log('About will be unmounted');
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'blue' }}></View>
    );
  }
}

class Contact extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    console.log('Contact is mounted');
  }

  sceneWillFocus() {
    console.log('Contact will be focused');
  }

  sceneWillBlur() {
    console.log('Contact will be Blured');
  }

  sceneDidBlur() {
    console.log('Contact did Blur');
  }

  sceneDidFocus() {
    console.log('Contact did focuse');
  }

  componentWillUnmount() {
    console.log('Contact will be unmounted');
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'yellow' }}></View>
    );
  }
}

class Example extends Component {
  constructor(props, context) {
    super(props, context)
  }

  async tests() {
    const sceneRef = this.refs.scene;

    await wait(2000);
    console.log('');
    sceneRef.goto('/about', {}, { replace: false });

    // await wait(2000);
    // console.log('');
    // sceneRef.goto('/contact', {}, { replace: false });
    //
    // await wait(1000);
    // sceneRef.goback();

    //
    // await wait(2000);
    // console.log('');
    // sceneRef.goto('/home', {}, { clearHistory: true });
  }

  componentDidMount() {
    this.tests();
  }

  render() {
    const cameraProps = {
      LeftMenu: LeftMenu,
      RightMenu: RightMenu,

      gestures: true,
      toleranceX: 10,
      toleranceY: 10,
      openLeftMenuOffset: openLeftMenuOffset,
      openRightMenuOffset: openRightMenuOffset,
      offsetUntilOpen: 50
    };

    return (
      <Scene ref="scene" initialPath="/home" camera={Cameras.With2SideMenus} cameraProps={cameraProps}>
        <Scene path="home" component={Home}/>
        <Scene path="about" component={About}/>
        <Scene path="contact" component={Contact}/>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('Example', () => Example);

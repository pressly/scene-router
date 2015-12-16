const React = require('react-native');
const SceneRouter = require('scene-router');

const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
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

  menuMightOpen() {
    console.log('LeftMenu might open');
  }

  menuDidOpen() {
    console.log('LeftMenu did open');
  }

  menuDidClose() {
    console.log('LeftMenu did close');
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{ height: 20 }}></View>
        <ScrollView automaticallyAdjustContentInsets={false} style={{ flex:1, backgroundColor: 'brown' }}>
          <Text onPress={() => console.log('bobo')}>Hello</Text>
        </ScrollView>
      </View>
    );
  }
}

class RightMenu extends Component {
  constructor(props) {
    super(props);
  }

  menuMightOpen() {
    console.log('RightMenu might open');
  }

  menuDidOpen() {
    console.log('RightMenu did open');
  }

  menuDidClose() {
    console.log('RightMenu did close');
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{ height: 20 }}></View>
        <ScrollView automaticallyAdjustContentInsets={false} style={{ flex:1, backgroundColor: 'white' }} contentContainerStyle={{ alignItems: 'flex-end' }}>
          <Text onPress={() => console.log('bobo')}>Hello</Text>
        </ScrollView>
      </View>    );
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

  async sceneDidFocus() {
    console.log('Home did focuse');

    // const { menu } = this.props;
    // await wait(1000);
    // menu.open('right');
    //
    // await wait(1000);
    // menu.close();
    //
    // await wait(1000);
    // menu.open('left');
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
    try {
      sceneRef.goto('/about', {}, { replace: false });
    } catch(e) {
      console.log(e)
    }

    // await wait(2000);
    // console.log('');
    // sceneRef.goto('/contact', {}, { replace: false });
    //
    // await wait(1000);
    // sceneRef.goback();


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

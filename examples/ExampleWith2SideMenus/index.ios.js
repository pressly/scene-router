var React = require('react-native');
var TwoSideMenus = require('react-native-2-side-menus');
var Scene = require('scene-router');

var {
  Component,
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

async function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

class Content extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.color, justifyContent: 'center', alignItems: 'center' }}/>
    );
  }
}

class Menu extends Component {
  constructor(props) {
    super(props);
  }

  menuMightOpen() {
    console.log('menu might open');
  }

  menuDidOpen() {
    console.log('menu did open');
  }

  menuDidClose() {
    console.log('menu did close');
  }

  render() {
    return (
      <Content {...this.props}/>
    );
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Content color="blue"/>
  }
}

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { menu, leftMenu, rightMenu } = this.refs;
    menu.moreLifeCycles(leftMenu, rightMenu);
  }

  render() {
    return (
      <TwoSideMenus
        ref="menu"
        leftMenu={<Menu ref="leftMenu" color="yellow"/>}
        rightMenu={<Menu ref="rightMenu" color="red"/>}>
        {this.props.children}
      </TwoSideMenus>
    );
  }
}

class Intro extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Content color="black"/>
    );
  }
}

class Faq extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Content color="brown"/>
    );
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { scene } = this.refs;

    await wait(2000);
    scene.goto('/home/info', { side:'right', withAnimation: true });

    await wait(2000);
    scene.goto('/home/faq', { side:'right', withAnimation: true });
  }

  render() {
    return (
      <Scene ref="scene" initialPath="/login">
        <Scene path="login" component={Login}/>
        <Scene path="home" component={App} fresh={true}>
          <Scene path="info" component={Intro}/>
          <Scene path="faq" component={Faq}/>
        </Scene>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('ExampleWith2SideMenus', () => Main);

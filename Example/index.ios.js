const React = require('react-native');
const SceneRouter = require('./lib');

const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Component
} = React;

const {
  Scene
} = SceneRouter;

class Home extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    console.log('Home is mounted');
  }

  render() {
    return (
      <View></View>
    );
  }
}

class Example extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <Scene initialPath="/home">
        <Scene path="home" component={Home}/>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('Example', () => Example);

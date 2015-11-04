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

class Example extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <Scene initialPath="/home">
        <Scene path="home" component={View}/>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('Example', () => Example);

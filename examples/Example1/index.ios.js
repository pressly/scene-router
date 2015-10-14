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

const window = Dimensions.get('window');

class Example1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.view1}/>
        <View style={styles.view2}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    //top: 0,
    //left: 0,
    //width: window.width * 2,
    //height: window.height,
    backgroundColor: 'transparent',
    transform: [{ translateY: 0 }, { translateX: -300 }]
  },
  view1: {
    position: 'absolute',
    width: window.width,
    height: window.height,

    top: 0,
    left: 0,
    backgroundColor: 'blue'
  },

  view2: {
    position: 'absolute',
    width: window.width,
    height: window.height,

    top: 0,
    left: window.width,
    backgroundColor: 'yellow'
  }
});

AppRegistry.registerComponent('Example1', () => Example1);

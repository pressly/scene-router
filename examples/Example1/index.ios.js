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

console.log(window);

//transform: [{ translateX: -100 }]

class Example1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width * 2,
    height: window.height,
    backgroundColor: 'red',
    transform: [{ translateY: 0 }, { translateX: -400 }]
  }
});

AppRegistry.registerComponent('Example1', () => Example1);

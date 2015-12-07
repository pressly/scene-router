/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Component
} = React;

var window = Dimensions.get('window');

class Example extends Component {
  constructor(props, context) {
    super(props, context);

    this.value = new Animated.Value(0);
  }

  componentDidMount() {
    Animated.timing(this.value, {
      toValue: window.width/2,
      duration: 2000
    }).start(() => {
      console.log('started');
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.view]}>
          <Animated.View style={[styles.view, styles.left, { left: -this.value }]}></Animated.View>
          <Animated.View style={[styles.view, styles.right, { left: this.value }]}></Animated.View>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
    top:0,
    left: 0,
    right: 0,
    bottom: 0
  },
  view: {
    overflow: 'hidden',
    position: 'absolute',
    width: window.width,
    height: window.height
  },
  left: {
    position: 'absolute',
    top: -100,
    left: -window.width/2,
    backgroundColor: 'red'
  },
  right: {
    position: 'absolute',
    top: 0,
    left: window.width/2,
    bottom: 0,
    right: 0,
    backgroundColor: 'yellow'
  }
});

AppRegistry.registerComponent('Example', () => Example);

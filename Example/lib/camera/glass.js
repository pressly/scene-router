const React = require('react-native');
const {
  Dimensions,
  StyleSheet,
  Component,
  View
} = React;

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0,
    width: window.width,
    height: window.height,
    top: 0,
    left: 0
  }
});

class Glass extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}/>
    );
  }
}

module.exports = Glass;

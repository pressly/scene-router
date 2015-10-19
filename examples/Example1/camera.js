const React = require('react-native');

const {
  StyleSheet,
  Component,
  View
} = React;



class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scenes: []
    }
  }

  _calcNextPosition(side) {

  }

  addScene(element, options) {
    options = options || {
      side: 'right',
      animationFunc: () => {}
    };


  }

  render() {
    const { scenes } = this.state;

    return (
      <View style={styles.cameraContainer}>
        {scenes.map((scene) => scene.element)}
      </View>
    );
  }
}

module.exports = Camera;

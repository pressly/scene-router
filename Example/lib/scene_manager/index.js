var React = require('react-native');
var Glass = require('./glass');

var {
  StyleSheet,
  Component,
  Animated
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

class SceneManager extends Component {
  constructor(props) {
    super(props);

    this._cameraPosition = new Animated.ValueXY();

    this.state = {
      sceneGraphs: []
    };
  }

  _buildSceneFromSceneGraph(sceneGraph) {
    return null;
  }

  renderBack() {
    return null;
  }

  render() {
    var scenes = this.state.sceneGraphs.map((sceneGraph) => {
      return this._buildSceneFromSceneGraph(sceneGraph);
    });

    return (
      <View style={styles.container}>
        {this.renderBack()}
        <Animated.View style={{ transform: this._cameraPosition.getTranslateTransform() }}>
          {scenes}
        </Animated.View>
        <Glass/>
      </View>
    );
  }
}

module.exports = SceneManager;

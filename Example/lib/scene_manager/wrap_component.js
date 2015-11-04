const React = require('react-native');

const {
  Dimensions,
  StyleSheet,
  Component,
  Animated
} = React;

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: window.width,
    height: window.height
  }
});

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

const wrapComponent = (SceneComponent) => {
  class WrapComponent extends Component {
    constructor(props, context) {
      super(props, context);
    }

    render() {
      const props = {};
      return (
        <Animated.View>
          <SceneComponent ref="scene" {...props}/>
        </Animated.View>
      );
    }
  }

  WrapComponent.displayName = `Scene(${getDisplayName(SceneComponent)})`;

  return WrapComponent;
};

module.exports = wrapComponent;

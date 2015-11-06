const React = require('react-native');

const {
  Dimensions,
  StyleSheet,
  Component,
  Animated
} = React;

const window = Dimensions.get('window');

const SCENE_REF = 'SCENE_REF';

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: window.width,
    height: window.height
  }
});

const wrapComponent = (SceneComponent) => {
  class WrapComponent extends Component {
    constructor(props, context) {
      super(props, context);
    }

    _getSceneRef() {
      const sceneRef = this.refs[SCENE_REF];
      if (sceneRef && sceneRef.getWrappedInstance) {
        return sceneRef.getWrappedInstance();
      }

      return sceneRef;
    }

    _callMethod(name) {
      const scene = this._getSceneRef();
      if (scene && scene[name]) {
        scene[name]();
      }
    }

    componentDidMount() {
      const { wrappedProps: { sceneDidMount } } = this.props;
      sceneDidMount(this);
    }

    componentWillUnmount() {
      const { wrappedProps: { sceneWillUnmount } } = this.props;
      sceneWillUnmount(this);
    }

    willBlur() {
      this._callMethod('sceneWillBlur');
    }

    didBlur() {
      this._callMethod('sceneDidBlur');
    }

    willFocus() {
      this._callMethod('sceneWillFocus');
    }

    didFocus() {
      this._callMethod('sceneDidFocus');
    }

    render() {
      const { sceneProps, wrappedProps: { position } } = this.props;
      const scenePosition = { top: position.y, left: position.x };

      return (
        <Animated.View style={[styles.container, scenePosition]}>
          <SceneComponent
            ref={SCENE_REF}
            {...sceneProps}/>
        </Animated.View>
      );
    }
  }

  WrapComponent.displayName = `Scene(${getDisplayName(SceneComponent)})`;

  return WrapComponent;
};

module.exports = wrapComponent;

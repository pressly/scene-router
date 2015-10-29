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

function purifyProps(props) {
  let newProps = { ...props };

  delete newProps.id;
  delete newProps.sceneDidMount;
  delete newProps.sceneWillUnmount;
  delete newProps.isChild;
  delete newProps.position;

  return newProps;
}

const sceneWrapper = (LoadingComponent) => {
  return (SceneComponent) =>
    class WrapComponent extends Component {
      constructor(props, context) {
        super(props, context);

        this.opacity = new Animated.Value(0);

        this.state = {
          isReady: !(!!LoadingComponent)
        };
      }

      componentDidMount() {
        const { sceneDidMount } = this.props;
        sceneDidMount(this, this.sceneReadyToRender.bind(this));
      }

      componentWillUnmount() {
        const { isChild, sceneWillUnmount } = this.props;
        sceneWillUnmount(this);
      }

      isSceneNeedLoading() {
        return !!LoadingComponent;
      }

      sceneReadyToRender() {
        if (this.isSceneNeedLoading() && !this.state.isReady) {
          this.setState({ isReady: true });
        }
      }

      willBlur() {
        const { scene } = this.refs;
        if (scene && scene.sceneWillBlur) {
          scene.sceneWillBlur();
        }
      }

      didBlur() {
        const { scene } = this.refs;
        this.opacity.setValue(0);
        if (scene && scene.sceneDidBlur) {
          scene.sceneDidBlur();
        }
      }

      willFocus() {
        const { scene } = this.refs;
        this.opacity.setValue(1);
        if (scene && scene.sceneWillFocus) {
          scene.sceneWillFocus();
        }
      }

      didFocus() {
        const { scene } = this.refs;
        if (scene && scene.sceneDidFocus) {
          scene.sceneDidFocus();
        }
      }

      render() {
        const { isChild, position } = this.props;
        const props = purifyProps(this.props);

        const renderedComponent = !this.state.isReady ?
                                    <LoadingComponent {...props}/> :
                                    <SceneComponent ref="scene" {...props}/>;

        const rootStyleOnly = isChild? {} : { top: position.y, left: position.x };

        return (
          <Animated.View style={[styles.container, rootStyleOnly, {opacity: this.opacity}]}>
            {renderedComponent}
          </Animated.View>
        );
      }
    }
};

module.exports = sceneWrapper;

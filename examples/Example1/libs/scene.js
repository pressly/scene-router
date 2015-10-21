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
    width: window.width,
    height: window.height
  }
});

function purifyProps(props) {
  let newProps = { ...props };

  delete newProps.id;
  delete newProps.sceneDidMount;
  delete newProps.sceneWillUnmount;

  return newProps;
}

const Scene = (LoadingComponent) => {
  return (SceneComponent) =>
    class WrapComponent extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          isReady: !(!!LoadingComponent)
        };
      }

      componentDidMount() {
        const { sceneDidMount } = this.props;
        sceneDidMount(this, this.sceneReadyToRender.bind(this));
      }

      componentWillUnmount() {
        const { sceneWillUnmount } = this.props;
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
        if (scene.sceneWillBlur) {
          scene.sceneWillBlur();
        }
      }

      didBlur() {
        const { scene } = this.refs;
        if (scene.sceneWillFocus) {
          scene.sceneWillFocus();
        }
      }

      willFocus() {
        const { scene } = this.refs;
        if (scene.sceneDidBlur) {
          scene.sceneDidBlur();
        }
      }

      didFocus() {
        const { scene } = this.refs;
        if (scene.sceneDidFocus) {
          scene.sceneDidFocus();
        }
      }

      render() {
        const { position } = this.props;
        const props = purifyProps(this.props);

        const renderedComponent = !this.state.isReady ?
                                    <LoadingComponent {...props}/> :
                                    <SceneComponent ref="scene" {...props}/>;

        return (
          <View ref="root" style={[styles.container, { top: position.y, left: position.x }]}>
            {renderedComponent}
          </View>
        );
      }
    }
};

module.exports = Scene;

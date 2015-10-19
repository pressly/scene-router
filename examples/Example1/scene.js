const React = requrie('react-native');
const {
  Component
} = React;

function getDisplayName(Wrapped) {
  return Wrapped.displayName || Wrapped.name || 'Component';
}

function purifyProps(props) {
  let newProps = { ...props };

  delete newProps.shouldSceneRender;
  delete newProps.showScene;

  return newProps;
}

export default const scene = () => {
  const wrapperScene = (Wrapped) => {
    class Scene extends Component {
      constructor(props, context) {
        super(props, context);
      }

      active() {
        const { showScene } = this.props;
        showScene();
      }

      componentDidMount() {
        const { wrappedRef } = this.refs;

        if (wrappedRef.onSceneActive) {
          wrappedRef.onSceneActive(this.active);
        } else {
          this.active();
        }
      }

      shouldComponentUpdate(newProps) {
        return newProps.shouldSceneRender;
      }

      render() {
        return (
          <Wrapped ref="wrappedRef" {...purifyProps(this.props)}>
            {this.props.children}
          </Wrapped>
        );
      }
    }

    Scene.displayName = `Scene(${getDisplayName(Wrapped)})`;
    Scene.Wrapped = Wrapped;

    Scene.propTypes = {
      shouldSceneRender: React.PropTypes.bool.isRequired,
      showScene: React.PropTypes.func.isRequired
    };
  };

  return wrapperScene;
};

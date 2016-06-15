# Scene Life Cycle

- Scene.props.sceneStatus = Activating
  it's set the default value of a new created scene. it also being set if
  the current scene is being dragged

- Scene.componentDidMount()
- Scene.props.sceneStatus = Activated
  once the animation is done

- Scene.props.sceneStatus = Deactivating
  it's being dragged or a new scene is about to replace it

- Scene.props.sceneStatus = Deactivated
  once the scene is completely covered by another scene or right before
  it's being deleted

- Scene.componentWillUnmount()

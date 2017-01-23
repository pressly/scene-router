the life cycle would be as follows:

### we don't have any scenes, go to a new one

- componentDidMount()
- sceneStatusUpdate(Status.SceneDidActive)

### we have a scene, go to a new one

- nextScene.componentDidMount()
- currScene.sceneStatusUpdate(Status.SceneWillDeactivate)
- doing the animation
- once the animation is done, currScene.sceneStatusUpdate(Status.SceneDidDeactivate)
- nextScene.sceneStatusUpdate(Status.SceneDidActive)

### going back

- currScene.sceneStatusUpdate(Status.SceneWillDeactivate)
- prevScene.sceneStatusUpdate(Status.SceneWillActivate)
- doing the animation
- once the animation is done, currScene.componentWillUnmount()
- prevScene.sceneStatusUpdate(Status.SceneDidActive)

### going back by gesture but cancel in middle

- currScene.sceneStatusUpdate()
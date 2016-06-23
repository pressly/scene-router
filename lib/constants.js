export const Side = {
  L: 1,
  R: 2,
  T: 3,
  B: 4
}

export const SceneStatus = {
  //if componentDidMount called does not mean the scene is visible. you have to wait for
  //props.sceneStatus to be `Activated`
  Activating: 1,    //when the scene is already mounted and will active shortly
  Activated: 2,     //once the animation is done and scene is visiable
  Deactivating: 3,  //once the user drags or a new scene about to replace the current scene
  Deactivated: 4,   //when the scene is completed cover by another scene.
  //when the scene is being removed from stack, componentWillUnmount should be used.
  //
  MigthDeactivate: 5,
  MightActivate: 6
}
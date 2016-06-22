import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import route from 'trie-route'

import { SceneStatus } from './constants'

const debugMode = !!__DEV__

let registerScenes = []

const window = Dimensions.get('window')
const SIZE = 3

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: SIZE * window.width,
    height: SIZE * window.height,
    backgroundColor: 'transparent',
    top: -window.height,
    left: -window.width,
    overflow: 'hidden'
  },
  staticView: {
    position: 'absolute',
    overflow: 'hidden',
    width: window.width,
    height: window.height,
    top: window.height,
    left: window.width
  }
})

export class Area extends Component {
  constructor(props, context) {
    super(props, context)

    const router = route.create()

    registerScenes.forEach(({ Scene, opts }) => {
      router.path(opts.path, (params, qs, extra) => {
        const scene = this.renderScene(Scene, params, qs, opts, extra)
        this.state.scenes.push(scene)
        this.state.paths.push(opts.path)
        this.setState(this.state)
      })
    })

    this.state = {
      id: 0,
      router,
      paths: [],
      scenes: [],
      stackRefs: [],
      isDraging: false,
      inProgress: false
    }

    //clear register scene
    if (!debugMode) {
      registerScenes = null
    }
  }

  findSceneIndexByPath(path) {
    const { paths } = this.state
    return paths.indexOf(path)
  }

  getTopSceneRef(index = 1) {
    const { stackRefs } = this.state
    if (stackRefs.length < index - 1) {
      return null
    }

    return stackRefs[stackRefs.length - index]
  }

  goto(path, args = {}) {
    const { router, inProgress } = this.state

    if (inProgress) {
      return
    }

    this.state.inProgress = true

    const currentActiveSceneRef = this.getTopSceneRef()
    if (currentActiveSceneRef) {
      currentActiveSceneRef.setSceneStatus(SceneStatus.Deactivating)
    }

    args.props = args.props || {}
    args.opts = args.opts || {}

    const err = router.process(path, args)
    if (err) {
      console.log(err)
    }

    if (currentActiveSceneRef) {
      currentActiveSceneRef.setSceneStatus(SceneStatus.Deactivated)
    }
  }

  goback(path = "") {
    let gobackIndex = -1
    let listOfRemovedSceneRefs

    if (this.state.inProgress) {
      return
    }

    if (path != "") {
      gobackIndex = this.findSceneIndexByPath(path)
      //the goback do nothing if path not found.
      if (gobackIndex === -1) {
        return
      }

      //if the path is match the last item which means the current scene,
      //then do nothing
      if (gobackIndex === this.state.paths.length - 1) {
        return
      }

      //if the path is one before current scene, then we simply let it go
      //do the simple goback
      if (gobackIndex === this.state.paths.length - 2) {
        gobackIndex = -1
      }
    }

    this.state.inProgress = true

    const currentSceneRef = this.state.stackRefs.pop()
    this.state.scenes.pop()
    this.state.paths.pop()

    currentSceneRef.setSceneStatus(SceneStatus.Deactivating)

    if (gobackIndex != -1) {
      this.state.scenes.splice(gobackIndex + 1)
      this.state.paths.splice(gobackIndex + 1)
      listOfRemovedSceneRefs = this.state.stackRefs.splice(gobackIndex + 1)

      //this loop goes over all removed scenes and first make them off-screen
      //then set the property to deactivating.
      listOfRemovedSceneRefs.forEach((sceneRef) => {
        sceneRef.makeOffScreen()
        sceneRef.setSceneStatus(SceneStatus.Deactivating)
      })
    }

    const prevSceneRef = this.getTopSceneRef()
    if (prevSceneRef) {
      prevSceneRef.setSceneStatus(SceneStatus.Activating)
    }

    currentSceneRef.close(() => {
      if (prevSceneRef) {
        prevSceneRef.setSceneStatus(SceneStatus.Activated)
      }

      currentSceneRef.setSceneStatus(SceneStatus.Deactivated)
      if (gobackIndex != -1) {
        listOfRemovedSceneRefs.forEach((sceneRef) => {
          sceneRef.setSceneStatus(SceneStatus.Deactivated)
        })
      }

      this.state.inProgress = false

      this.setState(this.state)
    })
  }

  renderScene (Scene, params, qs, opts, extra) {
    const props = {
      route: {
        params,
        qs,
      },
      opts: {
        ...opts,
        ...extra.opts
      },
      ...extra.props,
      onClose: () => {
        this.goback()
      },
      onOpen: (reset) => {
        this.state.inProgress = false
        const currentActiveSceneRef = this.getTopSceneRef()
        currentActiveSceneRef.setSceneStatus(SceneStatus.Activated)

        if (reset) {
          this.state.stackRefs.splice(0, this.state.stackRefs.length - 1)
          this.state.scenes.splice(0, this.state.scenes.length - 1)
          this.setState(this.state)
        }
      },
      onDrag: () => {
        this.state.isDraging = true

        const currentActiveSceneRef = this.getTopSceneRef()
        currentActiveSceneRef.setSceneStatus(SceneStatus.MigthDeactivating)

        const prevSceneRef = this.getTopSceneRef(2)
        if (prevSceneRef) {
          prevSceneRef.setSceneStatus(SceneStatus.MightActivating)
        }
      },
      onDragCancel: () => {
        let sceneRed

        if (this.state.isDraging) {
          this.state.isDraging = false

          //current scene
          sceneRed = this.getTopSceneRef()
          if (sceneRed) {
            sceneRed.setSceneStatus(SceneStatus.Activated)
          }

          //previous scene
          sceneRed = this.getTopSceneRef(2)
          if (sceneRed) {
            sceneRed.setSceneStatus(SceneStatus.Deactivated)
          }
        }
      }
    }

    this.state.id++;

    let sceneId = this.state.id

    return (
      <Scene
        ref={(ref) => {
          //when a component is being deleted,
          //this function is called
          if (ref != null) {
            this.state.stackRefs.push(ref)
          }
        }}
        key={sceneId}
        {...props}/>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.staticView}>
          {this.props.children}
        </View>
        {this.state.scenes}
      </View>
    )
  }
}

export const registerScene = (Scene, opts) => {
  if (debugMode) {
    const result = registerScenes.some((scene) => {
      return scene.opts.path === opts.path
    })

    if (!result) {
      registerScenes.push({ Scene, opts })
    } else {
      console.log(`path '${opts.path}' is already defined`)
    }
  } else {
    registerScenes.push({ Scene, opts })
  }
}

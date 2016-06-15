import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import route from 'trie-route'

import { SceneStatus } from './constants'

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
        this.setState(this.state)
      })
    })

    this.state = {
      id: 0,
      router,
      scenes: [],
      stackRefs: [],
      isDraging: false,
      inProgress: false
    }

    //clear register scene
    registerScenes = null
  }

  getTopSceneRef(index = 1) {
    const { stackRefs } = this.state
    if (stackRefs.length < index - 1) {
      return null
    }

    return stackRefs[stackRefs.length - index]
  }

  goto(path, props, opts) {
    const { router, inProgress } = this.state

    if (inProgress) {
      return
    }

    this.state.inProgress = true

    const currentActiveSceneRef = this.getTopSceneRef()
    if (currentActiveSceneRef) {
      currentActiveSceneRef.setSceneStatus(SceneStatus.Deactivating)
    }

    const err = router.process(path, { opts, props })
    if (err) {
      console.log(err)
    }

    if (currentActiveSceneRef) {
      currentActiveSceneRef.setSceneStatus(SceneStatus.Deactivated)
    }
  }

  goback() {
    if (this.state.inProgress) {
      return;
    }

    this.state.inProgress = true

    const ref = this.state.stackRefs.pop()
    this.state.scenes.pop()

    ref.setSceneStatus(SceneStatus.Deactivating)

    const prevSceneRef = this.getTopSceneRef()
    if (prevSceneRef) {
      prevSceneRef.setSceneStatus(SceneStatus.Activating)
    }

    ref.close(() => {
      if (prevSceneRef) {
        prevSceneRef.setSceneStatus(SceneStatus.Activated)
      }
      ref.setSceneStatus(SceneStatus.Deactivated)

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
      onOpen: () => {
        this.state.inProgress = false
        const currentActiveSceneRef = this.getTopSceneRef()
        currentActiveSceneRef.setSceneStatus(SceneStatus.Activated)
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
        if (this.state.isDraging) {
          this.state.isDraging = false

          const prevSceneRef = this.getTopSceneRef(2)
          if (prevSceneRef) {
            prevSceneRef.setSceneStatus(SceneStatus.Deactivating)
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
  registerScenes.push({ Scene, opts })
}

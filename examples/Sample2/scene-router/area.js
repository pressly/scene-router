// @flow

import React, { Component } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'

import * as constants from './constants'
import { Scene } from './scene'

import type { SceneConfig, Route } from './types'

// types //////////////////////////////////////////////////////////////////////

type AreaProps = {
  children?: any
}

type AreaState = {
  scenes: Array<React.Element<*>>,
  sceneRefs: Array<Scene>
}

// constants //////////////////////////////////////////////////////////////////

const sizeOfArea = 3
const window = Dimensions.get('window')
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: sizeOfArea * window.width,
    height: sizeOfArea * window.height,
    backgroundColor: 'transparent',
    transform: [{ translateX: -window.width }, { translateY: -window.height }],
    overflow: 'hidden'
  },
  staticView: {
    position: 'absolute',
    overflow: 'hidden',
    width: window.width,
    height: window.height,
    transform: [{ translateX: window.width }, { translateY: window.height }],
  }
})

// Area Component /////////////////////////////////////////////////////////////
// responsibility
// - add or remove scene
// - call updateSceneStatus on previous scene once a new scene is added or removed
// - provide a callback to each scene to be called once the gesture is happining

let sceneIdCount: number = 0

export class Area extends Component {
  props: AreaProps
  state: AreaState

  constructor(props: AreaProps, context: any) {
    super(props, context)

    this.state = {
      scenes: [],
      sceneRefs: []
    }
  }

  get currentIndex(): number {
    return this.state.scenes.length - 1
  }

  get currentSceneRef(): ?Scene {
    const index = this.currentIndex
    return index > -1 ? this.state.sceneRefs[index] : null
  }

  get previousSceneRef(): ?Scene {
    const index = this.currentIndex - 1
    return index > -1 ? this.state.sceneRefs[index] : null
  }

  // this Scene is SceneWrap function.
  // so we need to get the ref of scene itself
  push(SceneWrap: Function, route: Route, originalSceneConfig: SceneConfig, customSceneConfig: SceneConfig, done: ?Function) {
    let currSceneRef = this.currentSceneRef
    currSceneRef && currSceneRef.updateSceneStatus(constants.Inactive)

    this.state.scenes.push(
      <SceneWrap
        key={`scenewrap:${sceneIdCount++}`}
        sceneRef={(ref) => {
          ref && this.state.sceneRefs.push(ref)
        }}
        customSceneConfig={customSceneConfig}
        route={route}
      />
    )

    this.setState(this.state, () => {
      currSceneRef = this.currentSceneRef
      if (currSceneRef) {
        currSceneRef.open(() => {
          // at this point, animation is done, and scene is visible
          // we need to reset all the items inside array up to this scene
          // if customSceneConfig.reset is true and then call another setState.
          if (customSceneConfig.reset) {
            this.state.scenes.splice(0, this.state.scenes.length - 1)
            this.state.sceneRefs.splice(0, this.state.sceneRefs.length - 1)

            this.setState(this.state, () => {
              currSceneRef && currSceneRef.updateSceneStatus(constants.Active)
              done && done()
            })
          } else {
            currSceneRef && currSceneRef.updateSceneStatus(constants.Active)
            done && done()
          }
        })
      }
    })
  }

  pop(done: ?Function) {
    // if the current index is zero, it means that
    // we can't pop the view. This is the first view
    if (this.currentIndex < 1) {
      return
    }

    // because the current scene will be destroyed, 
    // there is no point of calling `updateSceneStatus(Status.Inactive)`
    // we are letting `componentWillUnmount` does the job
    //this.previousSceneRef.
    const currSceneRef = this.currentSceneRef
    const prevSceneRef = this.previousSceneRef

    currSceneRef && currSceneRef.close(() => {
      // remove the scene
      this.state.scenes.pop()
      this.state.sceneRefs.pop()
      
      // set the new state, this will rerender the area and once it's done,
      // we simply call the updateSceneStatus
      this.setState(this.state, () => {
        prevSceneRef && prevSceneRef.updateSceneStatus(constants.Active)
        done && done()
      })
    })
  }

  render() {
    const { scenes } = this.state

    return (
      <View style={styles.container}>
        <View style={styles.staticView}>
          {this.props.children}
        </View>
        {scenes}
      </View>
    )
  }
}
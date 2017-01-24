// @flow

import React, { Component } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'

import { Scene } from './scene'

import type { SceneOptions, RouteOptions } from './types'

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

  // this Scene is SceneWrap function.
  // so we need to get the ref of scene itself
  push(SceneWrap: Function, routeOptions: RouteOptions) {
    this.state.scenes.push(
      <SceneWrap
        key={`scenewrap:${sceneIdCount++}`}
        sceneRefs={(ref) => this.state.sceneRefs.push(ref)}
        routeOptions={routeOptions}
      />
    )

    this.setState(this.state)
  }

  pop() {
    this.state.scenes.pop()
    this.state.sceneRefs.pop()

    this.setState(this.state)
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
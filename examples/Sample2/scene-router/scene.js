// @flow

import React, { Component } from 'react'
import { Animated, View, StyleSheet, Dimensions, Platform } from 'react-native'

import * as constants from './constants'

import type { SceneConfig, Point, Route } from './types'

// types //////////////////////////////////////////////////////////////////////

type SceneProps = {
  WrapComponent: Function,
  sceneConfig: SceneConfig,
  route: Route
}

type SceneState = {
  ref: any,
  position: Animated.ValueXY
}

// constants //////////////////////////////////////////////////////////////////

const window = Dimensions.get('window')
const isAndroid = Platform.OS === 'android'
const toolbarHeight = isAndroid ? 25 : 0
const pointOfView: Point = { x: window.width, y: window.height }

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: window.width,
    height: window.height    
  }
})

// internal functions /////////////////////////////////////////////////////////

const calcSide = (side: number): Point => {
  let y
  let x

  switch (side) {
    case constants.FromLeft:
      y = window.height
      x = 0
      break

    case constants.FromRight:
      y = window.height
      x = 2 * window.width
      break

    case constants.FromTop:
      y = 0
      x = window.width
      break

    case constants.FromBottom:
      y = 2 * window.height
      x = window.width
      if (isAndroid) {
        y -= toolbarHeight
      }
      break

    case constants.Static:
      y = window.height
      x = window.width
      break

    default:
      throw new Error('side is unknown')
  }

  return { y, x }
}

// Scene Component ////////////////////////////////////////////////////////////

export class Scene extends Component {
  props: SceneProps
  state: SceneState

  constructor(props: SceneProps, context: any) {
    super(props, context)

    this.state = {
      ref: null,
      position: new Animated.ValueXY(calcSide(this.side(props.sceneConfig)))
    }
  }

  side(sceneConfig: SceneConfig): number {
    // NOTE: `sceneConfig.side` will always have a value as soon as being passed to
    // Scene component and the reason, I'm doing this to just remove the flow error
    return sceneConfig.side || constants.FromRight
  }

  updateSceneStatus = (status: number) => {
    const { ref } = this.state
    if (ref) {
      ref.updateSceneStatus && ref.updateSceneStatus(status)
    }
  }

  open(done: ?Function) {
    Animated.timing(
      this.state.position,
      {
        toValue: pointOfView,
        duration: 300
      }
    ).start(done)
  }

  close(done: ?Function) {
    const { sceneConfig } = this.props

    Animated.timing(
      this.state.position,
      {
        toValue: calcSide(this.side(sceneConfig)),
        duration: 300
      }
    ).start(done)
  }

  render() {
    const { route, WrapComponent, sceneConfig } = this.props
    const { position } = this.state
    const style = [
      styles.container, 
      { 
        transform: position.getTranslateTransform(), 
        backgroundColor: sceneConfig.backgroundColor
      }
    ]

    // we need to attach sceneConfig to route
    route.config = sceneConfig

    return (
      <Animated.View style={style}>
        <WrapComponent 
          ref={(ref) => this.state.ref = ref}
          route={route}/>
      </Animated.View>
    )
  }
}
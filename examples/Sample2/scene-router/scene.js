// @flow

import React, { Component } from 'react'
import { Animated, View, StyleSheet, Dimensions, Platform } from 'react-native'

import * as constants from './constants'

import type { SceneOptions, Point } from './types'

// types //////////////////////////////////////////////////////////////////////

type SceneProps = {
  WrapComponent: Function,
  sceneOptions: SceneOptions
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
      x = 0
      y = 0
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
      position: new Animated.ValueXY(calcSide(props.sceneOptions.side || constants.FromRight))
    }
  }

  open() {
    Animated.timing(
      this.state.position,
      {
        toValue: pointOfView,
        duration: 300
      }
    ).start()
  }

  close() {
    const { side } = this.props.sceneOptions

    Animated.timing(
      this.state.position,
      {
        toValue: calcSide(side || constants.FromRight),
        duration: 300
      }
    ).start()
  }

  componentDidMount() {
    this.open()
  }

  render() {
    const { WrapComponent, sceneOptions: { backgroundColor } } = this.props
    const { position } = this.state
    const style = [
      styles.container, 
      { 
        transform: position.getTranslateTransform(), 
        backgroundColor 
      }
    ]

    return (
      <Animated.View style={style}>
        <WrapComponent ref={(ref) => this.state.ref = ref}/>
      </Animated.View>
    )
  }
}
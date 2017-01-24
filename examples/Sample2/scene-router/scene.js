// @flow

import React, { Component } from 'react'
import { Animated, View, StyleSheet, Dimensions, Platform, PanResponder } from 'react-native'

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
  position: Animated.ValueXY,
  isDragging: boolean
}

type GestureResponderEvent = {
  nativeEvent: {
    changedTouches: Array<number>,
    identifier: number,
    locationX: number,
    locationY: number,
    pageX: number,
    pageY: number,
    target: number,
    timestamp: number,
    touches: Array<number>
  }
}

type PanResponderGestureState = {
  stateID: number,
  moveX: number,
  moveY: number,
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  vx: number,
  vy: number,
  numberActiveTouches: number
}

// constants //////////////////////////////////////////////////////////////////

const window = Dimensions.get('window')
const isAndroid = Platform.OS === 'android'
const toolbarHeight = isAndroid ? 25 : 0
const pointOfView: Point = { x: window.width, y: window.height }
const activePosition: Point = { x: window.width, y: window.height }

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

const shouldSceneClose = (side: number, threshold: number, x: number, y: number): boolean => {
  threshold = Math.abs(threshold)

  switch (side) {
    case constants.FromRight:
      return (x - threshold) > activePosition.x
    case constants.FromLeft:
      return (x + threshold) < activePosition.x
    case constants.FromTop:
      return (y + threshold) < activePosition.y
    case constants.FromBottom:
      return (y - threshold) > activePosition.y
    default:
      return false
  }
}

// Scene Component ////////////////////////////////////////////////////////////

export class Scene extends Component {
  props: SceneProps
  state: SceneState

  panResponder: Object
  startTouchPos: Point

  constructor(props: SceneProps, context: any) {
    super(props, context)

    this.state = {
      ref: null,
      position: new Animated.ValueXY(calcSide(this.side(props.sceneConfig))),
      isDragging: false
    }

    this.startTouchPos = { x: 0, y: 0 }

    this.panResponder = props.sceneConfig.gesture ? PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderTerminate
    }) : {}
  }

  onStartShouldSetPanResponder = (evt: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
    const { pageX, pageY } = evt.nativeEvent
    const { sceneConfig: { threshold, side } } = this.props

    // this if is only here to remove flow error
    if (!threshold) {
      return true
    }

    // we need to know if finger starts at the right side of window
    switch (side) {
      case constants.FromBottom:
        if (pageY > threshold) {
          return true
        }
        break
      case constants.FromTop:
        if (window.height - threshold > pageY) {
          return true
        }
        break
      case constants.FromLeft:
        if (window.width - threshold > pageX) {
          return true
        }
        break
      case constants.FromRight:
        if (pageX > threshold) {
          return true
        }
        break
      default:
        return true
    }

    this.startTouchPos.x = this.state.position.x.__getValue()
    this.startTouchPos.y = this.state.position.y.__getValue()    

    return false
  }

  onMoveShouldSetPanResponder = (evt: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
    console.log('move')
    return false
  }

  onPanResponderGrant = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {

  }

  onPanResponderMove = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {

  }

  onPanResponderRelease = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {

  }

  onPanResponderTerminate = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {

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
      <Animated.View style={style} {...this.panResponder.panHandlers}>
        <WrapComponent 
          ref={(ref) => this.state.ref = ref}
          route={route}/>
      </Animated.View>
    )
  }
}
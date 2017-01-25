// @flow

import React, { Component } from 'react'
import { Animated, View, StyleSheet, PanResponder } from 'react-native'

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
const window = constants.window
const pointOfView: Point = { x: window.width, y: window.height }
const startTouchPos: Point = { x: 0, y: 0 }

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
      y = 2 * window.height - window.softMenuHeight
      x = window.width
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
      return (x - threshold) > pointOfView.x
    case constants.FromLeft:
      return (x + threshold) < pointOfView.x
    case constants.FromTop:
      return (y + threshold) < pointOfView.y
    case constants.FromBottom:
      return (y - threshold) > pointOfView.y
    default:
      return false
  }
}

// Scene Component ////////////////////////////////////////////////////////////
const ignore = () => false

export class Scene extends Component {
  props: SceneProps
  state: SceneState

  panResponder: Object

  constructor(props: SceneProps, context: any) {
    super(props, context)

    this.state = {
      ref: null,
      position: new Animated.ValueXY(calcSide(this.side(props.sceneConfig))),
      isDragging: false
    }

    this.panResponder = props.sceneConfig.gesture ? PanResponder.create({
      onStartShouldSetPanResponderCapture: this.shouldStartDrag,
      onStartShouldSetPanResponder: ignore,
      onMoveShouldSetPanResponderCapture: ignore,
      onMoveShouldSetPanResponder: ignore,
      onPanResponderGrant: this.onStartDrag,
      onPanResponderMove: this.onMoveDrag,
      onPanResponderRelease: this.onEndDrag
    }) : {}
  }

  shouldStartDrag = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { pageX, pageY } = evt.nativeEvent
    const { sceneConfig: { threshold, side, gesture } } = this.props

    // this if is only here to remove flow error
    if (!threshold || !gesture) {
      return false
    }

    // we need to know if finger starts at the right side of window
    switch (side) {
      case constants.FromBottom:
        return pageY <= threshold
      case constants.FromTop:
        return window.height - threshold <= pageY
      case constants.FromLeft:
        return window.width - threshold <= pageX
      case constants.FromRight:
        return pageX <= threshold
      default:
        return false
    }
  }

  onStartDrag = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    startTouchPos.x = this.state.position.x.__getValue()
    startTouchPos.y = this.state.position.y.__getValue()
  }

  onMoveDrag = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy, moveX, moveY, x0, vx } = gestureState
    const { sceneConfig: { side } } = this.props
    const { position } = this.state

    switch (side) {
      case constants.FromLeft:
        if (dx < 0) {
          position.x.setValue(startTouchPos.x + dx)
        }      
      case constants.FromRight:
        if (dx > 0) {
          position.x.setValue(startTouchPos.x + dx)
        }
        break
      case constants.FromTop:
        if (dy < 0) {
          position.y.setValue(startTouchPos.y + dy)
        }
        break
      case constants.FromBottom:
        if (dy > 0) {
          position.y.setValue(startTouchPos.y + dy)
        }
        break
    }
  }

  onEndDrag = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { sceneConfig: { side, threshold } } = this.props
    const { position } = this.state
    const x = position.x.__getValue()
    const y = position.y.__getValue()

    if (!side || !threshold) {
      return
    }

    if (shouldSceneClose(side, threshold, x, y)) {
      this.close()
    } else {
      this.open()
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
      <Animated.View style={style} {...this.panResponder.panHandlers}>
        <WrapComponent 
          ref={(ref) => this.state.ref = ref}
          route={route}/>
      </Animated.View>
    )
  }
}
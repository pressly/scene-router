

import React, { Component, PropTypes } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  PanResponder
} from 'react-native'

import { window } from './dimensions'
import { Side, calcSide } from './side'
import type { SideType } from './side'
import { sceneRegister } from './registration'

type SceneOptionsType = {
  path: string,
  side: SideType,
  threshold?: number,
  gesture?: boolean,
  reset?: boolean,
  backgroundColor?: string
}

type SceneProps = {
  path: string,
  side: SideType,
  threshold: number,
  gesture: boolean,
  reset: boolean,
  backgroundColor: string,
  WrapComponent: Function,
  route: any
}

type SceneState = {
  position: Animated.ValueXY,
  opacity: Animated.Value,
  isDragging: boolean,
  ref: any
}

type GestureResponderEvent = {
  changedTouches: number,
  identifier: number,
  locationX: number,
  locationY: number,
  pageX: number,
  pageY: number,
  target: number,
  timestamp: number,
  touches: number
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

const mergeDefaultSceneOptions = (options: SceneOptionsType): SceneOptionsType => {
  return {
    side: Side.FromRight,
    threshold: 30,
    gesture: true,
    reset: false,
    backgroundColor: 'white',
    ...options
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: window.width,
    height: window.height
  }
})

class Scene extends Component {
  props: SceneProps
  state: SceneState
  panResponder: PanResponder

  constructor(props: SceneProps, context: any) {
    super(props, context)

    this.state = {
      position: new Animated.ValueXY(calcSide(props.side)),
      opacity: new Animated.Value(1),
      isDragging: false,
      ref: null
    }

    this.panResponder = props.gesture ? PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderTerminate
    }) : {}
  }

  onStartShouldSetPanResponder = (evt: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
    return false
  }

  onMoveShouldSetPanResponder = (evt: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
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

  render() {
    const { WrapComponent, backgroundColor } = this.props

    return (
      <Animated.View style={[styles.container, { transform: this.state.position.getTranslateTransform(), backgroundColor }]}>
        <WrapComponent ref={(ref) => this.state.ref = ref}/>
      </Animated.View>
    )
  }
}

export const scene = (sceneOptions: SceneOptionsType) => (Wrap: Function): Function => {
  sceneOptions = mergeDefaultSceneOptions(sceneOptions)

  const SceneWrap = (props: any) => {
    const { route, sceneRef } = props

    return (
      <Scene 
        ref={props.sceneRef}
        path={sceneOptions.path}
        side={sceneOptions.side}
        threshold={sceneOptions.threshold}
        gesture={sceneOptions.gesture}
        reset={sceneOptions.reset}
        backgroundColor={sceneOptions.backgroundColor}        
        WrapComponent={Wrap}
        route={route}/>
    )
  }

  // we need to register to area
  sceneRegister(SceneWrap, sceneOptions.path, sceneOptions.reset)

  return SceneWrap
}
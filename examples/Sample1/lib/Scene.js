import React, { Component, PropTypes } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  PanResponder
} from 'react-native'

import { registerScene } from './Area'

const window = Dimensions.get('window')
const isAndroid = Platform.OS === 'android'
const toolbarHeight = isAndroid ? 25 : 0

const activePosition = { x: window.width, y: window.height }

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    width: window.width,
    height: window.height
  }
})

export const Side = {
  L: 1,
  R: 2,
  T: 3,
  B: 4
}

const calcSide = (side) => {
  let y
  let x

  switch (side) {
    case Side.L:
      y = window.height
      x = 0
      break

    case Side.R:
      y = window.height
      x = 2 * window.width
      break

    case Side.T:
      y = 0
      x = window.width
      break

    case Side.B:
      y = 2 * window.height
      x = window.width
      if (isAndroid) {
        y -= toolbarHeight
      }
      break

    default:
      throw new Error('side is unknown')
  }

  return { y, x }
}

export const scene = (opts) => (Wrap) => {
  const Scene = class extends Component {
    constructor(props, context) {
      super(props, context)

      const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
        onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
        onPanResponderGrant: this._handlePanResponderGrant,
        onPanResponderMove: this._handlePanResponderMove,
        onPanResponderRelease: this._handlePanResponderEnd,
        onPanResponderTerminate: this._handlePanResponderEnd,
      })

      const overrideOpts = props.opts
      const side = overrideOpts.side || opts.side

      this.state = {
        isActive: false,
        side,
        position: new Animated.ValueXY(calcSide(side)),
        opacity: new Animated.Value(1),
        panResponder,
        startTouchPos: { x: 0, y: 0 }
      }
    }

    _handleStartShouldSetPanResponder = (evt, gestureState) => {
      console.log('should start?')
      this.state.startTouchPos.x = this.state.position.x.__getValue()
      this.state.startTouchPos.y = this.state.position.y.__getValue()
      return false
    }

    _handleMoveShouldSetPanResponder = (evt, gestureState) => {
      console.log('should move?')

      return true
    }

    _handlePanResponderGrant = (evt, gestureState) => {
      //show visiual to user that this view has responded.
      console.log('fadding')
      this.state.opacity.setValue(0.7)
    }

    _handlePanResponderMove = (evt, gestureState) => {
      //console.log(this.state.position)
      console.log('moving:', this.state.position.x, gestureState.dx)
      this.state.position.x.setValue(this.state.startTouchPos.x + gestureState.dx)
    }

    _handlePanResponderEnd = (evt, gestureState) => {
      //this responded has been canceled or another respondeded take over
      console.log('terminated')
      this.state.opacity.setValue(1)
    }

    componentDidMount() {
      Animated.timing(
        this.state.position,
        {
          toValue: activePosition,
          duration: 300
        }
      ).start(() => {
        console.log('animation done')
      })
    }

    render() {
      const { position, panResponder, opacity } = this.state
      const { opts, ...rest } = this.props

      const pos = position.getTranslateTransform()

      return (
        <Animated.View
          style={[styles.container, { transform: pos }, { opacity }]}
          {...panResponder.panHandlers}>
          <Wrap {...this.props}/>
        </Animated.View>
      )
    }
  }

  registerScene(Scene, opts)

  return Scene
}

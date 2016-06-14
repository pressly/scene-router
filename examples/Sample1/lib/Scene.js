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

export const SceneStatus = {
  //if componentDidMount called does not mean the scene is visible. you have to wait for
  //props.sceneStatus to be `Activated`
  Activating: 1,    //when the scene is already mounted and will active shortly
  Activated: 2,     //when the scene is completely visible
  Deactivating: 3,  //when the scene is covered by another scene or being deactivating
  Deactivated: 4    //when the scene is completely hidden
  //
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

const calcReverseSide = (side) => {
  switch (side) {
    case Side.L:
      side = Side.R
      break
    case Side.R:
      side = Side.L
      break
    case Side.T:
      side = Side.B
      break
    case Side.B:
      side = Side.T
      break
  }

  return calcSide(side)
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
        sceneStatus: SceneStatus.Activating,
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

    open = () => {
      Animated.timing(
        this.state.position,
        {
          toValue: activePosition,
          duration: 300
        }
      ).start(() => {
        console.log('view is active')
      })
    }

    close = () => {
      Animated.timing(
        this.state.position,
        {
          toValue: calcReverseSide(this.state.side),
          duration: 300
        }
      ).start(() => {
        console.log('view is inactive')
      })
    }

    componentDidMount() {
      this.open()
    }

    render() {
      const { position, panResponder, opacity } = this.state
      const { opts, ...rest } = this.props

      const pos = position.getLayout()

      return (
        <Animated.View
          style={[styles.container, {...pos}]}
          {...panResponder.panHandlers}>
          <View style={{ backgroundColor: 'white' }}>
            <Animated.View style={{ opacity }}>
              <Wrap {...this.props}/>
            </Animated.View>
          </View>
        </Animated.View>
      )
    }
  }

  registerScene(Scene, opts)

  return Scene
}

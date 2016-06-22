import React, { Component, PropTypes } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  PanResponder
} from 'react-native'

import { Side, SceneStatus } from './constants'
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

const shouldSceneClose = (side, threshold, x, y) => {
  let result = false

  threshold = Math.abs(threshold)

  switch (side) {
    case Side.R:
      result = (x - threshold) > activePosition.x
      break
    case Side.L:
      result = (x + threshold) < activePosition.x
      break
    case Side.T:
      result = (y + threshold) < activePosition.y
      break
    case Side.B:
      result = (y - threshold) > activePosition.y
      break
  }

  return result
}

const defaultOpts = {
  side: Side.L,
  threshold: 50,
  gesture: true,
  reset: false,
  animate: true,
  backgroundColor: 'white'
}

const isSet = (value, defaultValue) => {
  if (typeof value !== value) {
    return value
  }
  return defaultValue
}

export const scene = (opts = {}) => (Wrap) => {

  opts = {
    ...defaultOpts,
    ...opts
  }

  class Scene extends Component {
    constructor(props, context) {
      super(props, context)

      const userOpts = props.opts
      const side = isSet(userOpts.side, opts.side)
      const threshold = isSet(userOpts.threshold, opts.threshold)
      const animate = isSet(userOpts.animate, opts.animate)
      const gesture = animate && isSet(userOpts.gesture, opts.gesture)
      const reset = isSet(userOpts.reset, opts.reset)
      const backgroundColor = isSet(userOpts.backgroundColor, opts.backgroundColor)

      const panResponder = gesture ? PanResponder.create({
        onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
        onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
        onPanResponderGrant: this._handlePanResponderGrant,
        onPanResponderMove: this._handlePanResponderMove,
        onPanResponderRelease: this._handlePanResponderEnd,
        onPanResponderTerminate: this._handlePanResponderEnd,
      }) : {}

      this.state = {
        sceneStatus: SceneStatus.Activating,
        side,
        position: new Animated.ValueXY(calcSide(side)),
        opacity: new Animated.Value(1),
        panResponder,
        startTouchPos: { x: 0, y: 0 },
        threshold,
        shouldSceneDrag: false,
        reset,
        animate,
        backgroundColor
      }
    }

    _handleStartShouldSetPanResponder = (evt, gestureState) => {
      const {
        nativeEvent: { pageX, pageY }
      } = evt

      const { threshold, side } = this.state

      this.state.shouldSceneDrag = false

      switch (side) {
        case Side.B:
          if (pageY > threshold) {
            return false
          }
          break
        case Side.T:
          if (window.height - threshold > pageY) {
            return false
          }
          break
        case Side.L:
          if (window.width - threshold > pageX) {
            return false
          }
          break
        case Side.R:
          if (pageX > threshold) {
            return false
          }
          break
      }

      this.state.shouldSceneDrag = true

      this.state.startTouchPos.x = this.state.position.x.__getValue()
      this.state.startTouchPos.y = this.state.position.y.__getValue()
      return false
    }

    _handleMoveShouldSetPanResponder = (evt, gestureState) => {
      if (!this.state.shouldSceneDrag) {
        return false
      }

      const { dx, dy } = gestureState
      switch(this.state.side) {
        case Side.L:
          return dx < 0
        case Side.R:
          return dx > 0
        case Side.T:
          return dy < 0
        case Side.B:
          return dy > 0
        default:
          return false
      }
    }

    _handlePanResponderGrant = (evt, gestureState) => {
      //show visiual to user that this view has responded.
      this.props.onDrag()
      this.setOpacity(0.7)
    }

    _handlePanResponderMove = (evt, gestureState) => {
      //console.log(this.state.position)
      const { dx, dy } = gestureState
      const {
        position,
        startTouchPos
      } = this.state

      switch (this.state.side) {
        case Side.L:
          if (dx < 0) {
            position.x.setValue(startTouchPos.x + dx)
          }
          break
        case Side.R:
          if (dx > 0) {
            position.x.setValue(startTouchPos.x + dx)
          }
          break
        case Side.T:
          if (dy < 0) {
            position.y.setValue(startTouchPos.y + dy)
          }
          break
        case Side.B:
          if (dy > 0) {
            position.y.setValue(startTouchPos.y + dy)
          }
        default:
          //do nothing
      }
    }

    _handlePanResponderEnd = (evt, gestureState) => {
      const { side, position: { x, y } } = this.state

      //this responded has been canceled or another respondeded take over
      if (shouldSceneClose(side, 50, x.__getValue(), y.__getValue())) {
        this.close()
      } else {
        this.open(() => {
          this.props.onDragCancel()
        })
      }

      this.state.opacity.setValue(1)
    }

    open = (fn) => {
      if (!this.state.animate) {
        this.state.position.setValue(activePosition)
        setTimeout(() => {
          if (fn) { fn() }
        }, 100)
        return
      }

      Animated.timing(
        this.state.position,
        {
          toValue: activePosition,
          duration: 300
        }
      ).start(fn)
    }

    close = (fn) => {
      Animated.timing(
        this.state.position,
        {
          toValue: calcSide(this.state.side),
          duration: 300
        }
      ).start(() => {
        if (fn) {
          fn()
        } else {
          this.props.onClose()
        }
      })
    }

    setSceneStatus = (sceneStatus) => {
      this.setState({
        sceneStatus
      })
    }

    setOpacity = (val) => {
      this.state.opacity.setValue(val)
    }

    makeOffScreen() {
      this.state.position.setValue(calcSide(this.state.side))
    }

    componentDidMount() {
      this.open(() => {
        this.props.onOpen(this.state.reset)
        this.props.onDragCancel()
      })
    }

    render() {
      const { position, panResponder, opacity, sceneStatus, backgroundColor } = this.state
      const { onClose, onOpen, onDrag, onDragCancel, opts, ...rest } = this.props

      const pos = position.getLayout()

      return (
        <Animated.View
          style={[styles.container, {...pos}]}
          {...panResponder.panHandlers}>
          <View style={{ flex: 1, backgroundColor }}>
            <Animated.View style={{ flex: 1, opacity }}>
              <Wrap
                sceneStatus={sceneStatus}
                {...this.props}/>
            </Animated.View>
          </View>
        </Animated.View>
      )
    }
  }

  registerScene(Scene, opts)

  return Scene
}

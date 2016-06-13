import React, { Component, PropTypes } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated
} from 'react-native'

const window = Dimensions.get('window')
const isAndroid = Platform.OS === 'android'
const toolbarHeight = isAndroid ? 25 : 0

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    width: window.width,
    height: window.height
  }
})

export const Side = {
  L: 0,
  R: 1,
  T: 2,
  B: 3
}

const calcSide = (side) => {
  let top
  let left

  switch (side) {
    case Side.L:
      top = window.height
      left = 0
      break

    case Side.R:
      top = window.height
      left: 2 * window.width
      break

    case Side.T:
      top = 0
      left = window.width
      break

    case Side.B:
      top = 2 * window.height
      left = window.width
      if (isAndroid) {
        top -= toolbarHeight
      }
      break

    default:
      throw new Error('side is unknown')
  }

  return { top, left }
}

export const scene = (Wrap) => {
  return class Scene extends Component {
    constructor(props, context) {
      super(props, context)
      this.state = {
        isActive: false,
        side: props.side,
        position: new Animated.ValueXY()
      }
    }

    render() {
      const { side, ...rest } = this.props
      const { left, top } = calcSide(side)

      return (
        <View style={styles.container, { top: top, left }}>
          <Wrap {...rest}/>
        </View>
      )
    }
  }
}

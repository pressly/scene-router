// @flow

import React, { Component } from 'react'
import { View, Animated, StyleSheet, Dimensions } from 'react-native'

const window = Dimensions.get('window')

const styles = StyleSheet.create({
  areaContainer: {
    flex: 1,
    position: 'absolute',
    width: 3 * window.width,
    height: 3 * window.height,
    backgroundColor: 'yellow',
    top: -window.height,
    left: -window.width,
    overflow: 'hidden'
  }
})

class Area extends Component {
  render() {
    return (
      <View style={styles.areaContainer}>
        {this.props.children}
      </View>
    )
  }
}

class Scene extends Component {
  animation: Animated.ValueXY

  constructor(props: any, context: any) {
    super(props, context)

    this.animation = new Animated.ValueXY(0, 0)
  }

  componentDidMount() {
    Animated.timing(this.animation, {
      toValue: {x: window.width, y: window.height},
      duration: 500,
      useNativeDriver: true
    }).start()
  }

  //[{ translateX: window.width }, { translateY: window.height }]

  render() {
    return (
      <Animated.View style={{ transform: this.animation.getTranslateTransform(), width: window.width, height: window.height, backgroundColor: 'red'}}>
      </Animated.View>
    )
  }
}

export class App extends Component {
  render() {
    return (
      <Area>
        <Scene />
      </Area>
    )
  }
}
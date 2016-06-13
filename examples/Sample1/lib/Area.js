import React, { Component } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'

const window = Dimensions.get('window')
const SIZE = 3

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: SIZE * window.width,
    height: SIZE * window.height,
    backgroundColor: 'transparent',
    top: -window.height,
    left: -window.width,
    overflow: 'hidden'
  }
})

export default class Area extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.children}
      </View>
    )
  }
}

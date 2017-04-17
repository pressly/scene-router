// @flow

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { window } from 'react-native-dimensions'

const spaceSize = 3
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    width: spaceSize * window.width,
    height: spaceSize * window.height,
    transform: [{ translateX: -window.width }, { translateY: -window.height }],
    backgroundColor: 'transparent'
  }
})

type SpaceProps = {
  children?: Array<React.Element<any>>
}

export const Space = (props: SpaceProps) => {
  const { children } = props

  return (
    <View style={styles.container}>
      {children}
    </View>
  )
}

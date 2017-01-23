
import React, { Component } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'

export type AreaProps = {
}

export type AreaState = {
  scenes: Array<any>
}

const window = Dimensions.get('window')
const VIEW_SIZE = 3

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: VIEW_SIZE * window.width,
    height: VIEW_SIZE * window.height,
    backgroundColor: 'yellow',
    top: -window.height,
    left: -window.width,
    overflow: 'hidden'
  }
})

export class Area extends Component {
  props: AreaProps
  state: AreaState

  constructor(props: AreaProps, context: any) {
    super(props, context)

    this.state = {
      scenes: []
    }
  }

  push(scene: any): void {
    this.state.scenes.push(scene)
    this.setState(this.state)
  }

  pop(): void {
    if (this.state.scenes.length > 0) {
      this.state.scenes.pop()
      this.setState(this.state)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.scenes}
      </View>
    )
  }
}
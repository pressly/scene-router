import React, { Component } from 'react'
import { View, Text, Dimensions } from 'react-native'

import Area from './lib/Area'
import { scene, Side } from './lib/Scene'

const window = Dimensions.get('window')


// <View style={{
//   position: 'absolute',
//   overflow: 'hidden',
//   top: 120,
//   left: 20,
//   width: window.width,
//   height: window.height,
//   backgroundColor: 'red'
// }}/>

@scene
class MyView extends Component {
  render() {
    return (
      <View style={{
        backgroundColor: 'red',
        flex: 1,
        height: window.height,
        width: window.width
      }}></View>
    )
  }
}

export default class App extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <Area>
        <MyView side={Side.B}/>
      </Area>
    )
  }
}

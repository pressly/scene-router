import React, { Component } from 'react'
import { View, Text, Dimensions } from 'react-native'

import Area, { access } from './lib/Area'
import { scene, Side } from './lib/scene'

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

/*
  <Link path="/....." props={{}}
*/

/*
  options can be
  {
    path,
    side
  }
*/
@scene({
  path: "home",
  side: Side.R
})
class Home extends Component {
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

@scene({
  path: "about",
  side: Side.L
})
class About extends Component {
  render() {
    return (
      <View style={{
        backgroundColor: 'green',
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

    this.state = {
      path: ''
    }

    setTimeout(() => {
      this.setState({
        path: 'home'
      })
    }, 2000)

    setTimeout(() => {
      this.setState({
        path: 'about'
      })
    }, 4000)
  }

  render() {
    return (
      <Area
        path={this.state.path}
        opts={{ }}
        props={{ }}>

      <View style={{
          backgroundColor: 'blue',
          flex: 1,
          height: window.height,
          width: window.width
        }}
      />

      </Area>
    )
  }
}

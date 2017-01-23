// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import { scene, Router } from './scene-router'

class Scene1 extends Component { 
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'red' }}>
      </View>
    )
  }
}

scene({
  path: '/scene1'
})(Scene1)

class Scene2 extends Component { 
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'blue' }}>
      </View>
    )
  }
}

scene({
  path: '/scene2'
})(Scene2)

export class App extends Component {
  state: { path: string }

  constructor(props: any, context: any) {
    super(props, context)

    this.state = {
      path: '/scene1'
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ path: '/scene2' })
    }, 2000)
  }

  render() {
    const { path } = this.state

    return (
      <Router
        area="default"
        action="goto"
        options={{
          path
        }}
      />
    )
  }
}
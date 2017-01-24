// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import { scene, Router, Side, Status } from './scene-router'

const delay = (timeout: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}

@scene({
  path: '/scene1',
  side: Side.FromBottom
})
class Scene1 extends Component {
  updateSceneStatus(status) {
    console.log(`scene1's status`, status)
  }

  render() {
    console.log(this.props)
    return (
      <View style={{ flex: 1, backgroundColor: 'red' }}>
      </View>
    )
  }
}


@scene({
  path: '/scene2/:id'
})
class Scene2 extends Component {
  updateSceneStatus(status) {
    console.log(`scene2's status`, status)
  }

  render() {
    console.log(this.props)
    return (
      <View style={{ flex: 1, backgroundColor: 'blue' }}>
      </View>
    )
  }
}


export class App extends Component {
  state: { area: string, action: 'goto' | 'goback', config: any }

  constructor(props: any, context: any) {
    super(props, context)

    this.state = {
      area: "default",
      action: 'goto',
      config: {
        path: '/scene1'
      }
    }
  }

  async componentDidMount(): any {
    await delay(2000)
    this.setState({ 
      area: "default",
      action: 'goto',
      config: {
        path: '/scene2/10',
        side: Side.Static 
      }
    })

    await delay(2000)
    this.setState({
      area: "default",
      action: 'goback',
      config: {}
    })    

    await delay(3000)
    this.setState({
      area: "default2",
      action: 'goto',
      config: {
        path: '/scene2/12',
        side: Side.FromTop
      }
    })
  }

  render() {
    const { area, action, config } = this.state

    return (
      <Router
        area={area}
        action={action}
        config={config}
      />
    )
  }
}
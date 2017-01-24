// @flow

import React, { Component } from 'react'
import { View, Text } from 'react-native'

import { scene, Router, Side, Status } from './scene-router'

const genColor = () => '#' + Math.floor(Math.random()*16777215).toString(16)

const delay = (timeout: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}

@scene({
  path: '/scene1/:id',
  side: Side.FromBottom
})
class Scene1 extends Component {
  updateSceneStatus(status) {
    
  }

  render() {
    const { route } = this.props

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: genColor() }}>
        <Text>Scene1: {route.params.id}</Text>
      </View>
    )
  }
}


@scene({
  path: '/scene2/:id'
})
class Scene2 extends Component {
  updateSceneStatus(status) {
    
  }
  render() {
    const { route } = this.props
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: genColor() }}>
        <Text>Scene2: {route.params.id}</Text>
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
        path: '/scene1/1'
      }
    }
  }

  async componentDidMount(): any {

    await delay(2000)
    this.setState({ 
      area: "default",
      action: 'goto',
      config: {
        path: '/scene1/2'
      }
    })

    await delay(2000)
    this.setState({ 
      area: "default",
      action: 'goto',
      config: {
        path: '/scene1/3',
        //reset: true
      }
    })



    await delay(2000)
    this.setState({
      area: "default",
      action: 'goback',
      config: {}
    })

    // await delay(3000)
    // this.setState({
    //   area: "default2",
    //   action: 'goto',
    //   config: {
    //     path: '/scene2/12',
    //     side: Side.FromTop
    //   }
    // })
  }

  render() {
    const { area, action, config } = this.state

    return (
      <Router
        area={area}
        action={action}
        config={config}>
        <View style={{ flex: 1, backgroundColor: 'red' }}>
        </View>
      </Router>
    )
  }
}
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
  render() {
    console.log(this.props)
    return (
      <View style={{ flex: 1, backgroundColor: 'blue' }}>
      </View>
    )
  }
}


export class App extends Component {
  state: { area: string, action: 'goto' | 'goback', options: any }

  constructor(props: any, context: any) {
    super(props, context)

    this.state = {
      area: "default",
      action: 'goto',
      options: {
        path: '/scene1'
      }
    }
  }

  async componentDidMount(): any {
    await delay(2000)
    this.setState({ 
      area: "default",
      action: 'goto',
      options: {
        path: '/scene2/10',
        side: Side.Static 
      }
    })

    await delay(2000)
    this.setState({
      area: "default",
      action: 'goback',
      options: {}
    })    

    await delay(3000)
    this.setState({
      area: "default2",
      action: 'goto',
      options: {
        path: '/scene2/12',
        side: Side.FromTop
      }
    })
  }

  render() {
    const { area, action, options } = this.state

    return (
      <Router
        area={area}
        action={action}
        options={options}
      />
    )
  }
}
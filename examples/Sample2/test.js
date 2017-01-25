// @flow

import React, { Component } from 'react'
import { View, Text, ScrollView } from 'react-native'

import { scene, Router, Side, Status } from './scene-router'

const genColor = () => "#"+((Math.random()+2)*16777216|0).toString(16).slice(1)//'#' + Math.floor(Math.random()*16777215).toString(16)

const delay = (timeout: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}

@scene({
  path: '/scene1/:id',
  side: Side.FromRight
})
class Scene1 extends Component {
  updateSceneStatus(status: number) {
    let statusStr: string
    switch (status) {
      case Status.Active:
        statusStr = 'active'
        break
      case Status.Inactive:
        statusStr = 'inactive'
        break
      default:
        statusStr = 'undefined'
    }

    console.log(`Scene1 with id ${this.props.route.params.id} is ${statusStr}`)
  }

  componentWillUnmount() {
    console.log(`Scene1 with id ${this.props.route.params.id} is removed`)
  }

  render() {
    const { route } = this.props

    return (
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: genColor() }}>
        <Text>Scene1: {route.params.id}</Text>
      </ScrollView>
    )
  }
}


@scene({
  path: '/scene2/:id'
})
class Scene2 extends Component {
  updateSceneStatus(status: number) {
    let statusStr: string
    switch (status) {
      case Status.Active:
        statusStr = 'active'
        break
      case Status.Inactive:
        statusStr = 'inactive'
        break
      default:
        statusStr = 'undefined'
    }

    console.log(`Scene2 with id ${this.props.route.params.id} is ${statusStr}`)
  }

  componentWillUnmount() {
    console.log(`Scene2 with id ${this.props.route.params.id} is removed`)
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
        path: '/scene1/1',
        threshold: 30,
        side: Side.FromLeft,
        gesture: true
      }
    }
  }

  async componentDidMount(): any {

    // await delay(2000)
    // this.setState({ 
    //   area: "default",
    //   action: 'goto',
    //   config: {
    //     path: '/scene1/2'
    //   }
    // })

    // await delay(2000)
    // this.setState({ 
    //   area: "default",
    //   action: 'goto',
    //   config: {
    //     path: '/scene1/3',
    //     //reset: true
    //   }
    // })

    // await delay(2000)
    // this.setState({
    //   area: "default",
    //   action: 'goback',
    //   config: {}
    // })

    // await delay(2000)
    // this.setState({
    //   area: "default2",
    //   action: 'goto',
    //   config: {
    //     path: '/scene2/1',
    //     //reset: true
    //   }
    // })    

    // await delay(2000)
    // this.setState({
    //   area: "default",
    // })    

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
        <View style={{ 
          flex: 1, 
          backgroundColor: 'red' 
        }}/>
      </Router>
    )
  }
}
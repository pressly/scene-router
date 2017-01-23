

import React, { Component } from 'react'

import { getHistory, History } from './history'
import { Area } from './area'

export type RouterGotoAction = {
  type: 'goto',
  path: string,
  reset: boolean,
  props: ?Object
}

export type RouterGobackAction = {
  type: 'goback'
}

export type RouterSectionAction = {
  type: 'section',
  name: string
}

export type RouterProps = {
  section: string,
  action: RouterGotoAction | RouterGobackAction | RouterSectionAction
}

export type RouterState = {
  sections: Map<string, Array<any>>
  sectionRefs: Map<string, Array<any>>
}

export class Router extends Component {
  props: RouterProps
  state: RouterState

  constructor(props: RouterProps, context: any) {
    super(props, context)

    this.state = {
      sections: new Map()
    }

    getHistory().setRouteCallback(this.routeCallback)
  }

  routeCallback = (scene: Function, params: ?Object, qs: ?Object, extra: ?Object): void => {
    
  }

  getSection(name: string): Area {
    const { sections, sectionRefs } = this.state
    const sectionRef = sectionRefs.get(name)
    if ()
  }  

  render() {
    return (

    )
  }
}
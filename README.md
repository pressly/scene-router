## scene-Router (v2)

A complete scene routing library written in pure JavaScript for React Native. It supports **iOS** and **Android**.
The api is so easy that you just have to learn only 2 simple things, `scene` decorator and `Router` component.

## Description

We, at [Pressly](https://pressly.com), using react-native and our app consists of large number of scenes. We wanted somthing super simple, it went through a lot of internal reversion, until we decided to open source it.

`scene-router` supports the following out of box:

- url like path, which can contains `params` and `query strings`. e.g. '/user/:id'
- passing custom props to target scene
- storeless, you can connect to `redux` or `mobx` stores
- reset stack of scenes
- animating scene from all 4 direction
- gesture enable
- configure scene settings at scene difinition and route time
- all animation are being configure to optimize `useNativeDriver` feature

## Installation

```bash
npm install scene-router
```

## Prerequisite

we recommended to use decorator. It makes the code a lot easier to maintain. If you don't want to use it, that's ok too.

in order to enable decorator in your `react-native` project follow the 3 steps below, 

1: install `babel-plugin-transform-decorators-legacy` using `yarn` or `npm` and
2: configure your `.babelrc` file as follows

```js
{
  "extends": "react-native/packager/react-packager/rn-babelrc.json",
  "plugins": ["transform-decorators-legacy"]
}
```

3: if you are using flowtype, make sure to add `esproposal.decorators=ignore` under `[options]` tags inside `.flowconfig` file

## Usage

There are 2 things you should learn about `scene-router` in oreder to start using it in your project

### `scene` decorator

`scene` is a decorator feature which register your component as a scene. here's an example

```js
import React, { Component } from 'react'
import { scene } from 'scene-router'

@scene({
  path: '/scene1'
})
class MyFirstScene extends Component {
  render() {
    ...
  }
}
```

a little bit of explaination, what we did was adding `scene` as a decorator on top of our first component `MyFirstScene`. We were passing `path`. This is our path to this scene.
so every time, `Router` wants to render this scene, all it needs a path url. `scene-router` will handle all coordinations and animations behind the scene.

you might ask, so what if I want to show my scene from top to bottom. As I said, `scene` decorator accepts many arguments. except `path` the rest of the arguments are optional.
here's the list of all options

| option  | type | required | default value | route time change | Description |
| ------- | ---- | -------- | ------------- | ----- | ----- |
| path    | String  | Yes | N/A | No | register a scene with this unique path |
| side    | Side | No | Side.FromRight | Yes | how the scene will animated, from which side |
| threshold | Number | No | 30 | Yes | how far from side you have to swip to make the gesture working |
| gesture | Boolean | No | true | Yes | enable or disable gesture |
| reset | Boolean | No | false | Yes | all scenes prior to this scene will be destroyed |
| backgroundColor | String | No | white | Yes | the back color of each scene |

ther are 5 differant sides you can choose from

| name| description |
| --- | ----------- |
| FromLeft | Animate the Scene From Left to Right |
| FromRight | Animate the Scene From Right to Left |
| FromTop | Animate the Scene From Top to Bottom |
| FromBottom | Animate the Scene From Bottom to Top |
| Static | No animation |


There is one little thing, every component which decorated with `scene` will have a method called, `updateSceneStatus(status: Status)`. This method will be called based on whether your scene is 
`Active`, `InActive`, `MightActive` or `MightInActive`. In other words, We are adding 4 more lifecycles to React. remember this is just a utility to help you!

```js
import React, { Component } from 'react'
import { scene, Status } from 'scene-router'

@scene({
  path: '/scene1'
})
class MyFirstScene extends Component {
  updateSceneStatus(status) {
    switch(status) {
      case Status.Active:
        break
      case Status.InActive:
        break
      case Status.MightActive:
        break
      case Status.MightInActive:
        break
    }
  }

  render() {
    ...
  }
}
```

here's a little bit of description:

| value | Description |
| ----- | ----------- |
| Active | when the animation is done and scene is visible |
| InActive | when a scene is already covered or gone |
| MightInActive | during dragging a scene. the current scene will get this value |
| MightActive | the previous and covered scene by current during dragging with get this value|


### `Router` component

the second thing to learn is `Router`. This is your entry point of your app. It has only 3 props, `area`, `action` and `config`.

- `area` is a string which defines an area with a name. if you plan to use tabs, each individual tab must have a unique name, that name can be passed to `area`
- `action` is a string which accepts either `goto` or `goback`. if you pass `goback`, the 3rd prop, `config`, will be ignored.
- `config` is defining which `path` you want to go and if you want to override any `scene` configuration.

here's an example of `Router`

```js
import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { scene, Router } from 'scene-router'

@scene({
  path: '/scenes/:id'
})
class Scenes extends Component {
  render() {
    const { route: { params } } = this.props

    return (
      <View style={{ flex: 1}}>
        <Text>{params.id}</Text>
      </View>
    )
  }
}

class App extends Component {
  constructor(props: any, context: any) {
    super(props, context)

    this.state = {
      area: "default",
      action: 'goto',
      config: {
        path: '/scenes/1'
      }
    }
  }

  render() {
    const { area, action, config } = this.state

    return (
      <Router
        area={area}
        action={action}
        config={config} />
    )
  }
}
```

> NOTE `Router` component also accepts one Componet as a child, This Component is being displayed and renderd first before the first route is triggered. this is a good place to put your splash screen.

Cheers.

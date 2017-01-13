## SCENE-ROUTER

A complete scene routing library written in pure JavaScript for React Native. It supports **iOS** and **Android**.

## Description
We, at [Pressly](https://pressly.com), using react-native at the beginning. Our app compose of a huge number of views and in order to maintain the code base we decided to refer to each View by link. Link can have `params` and `query strings`. There is no need for nested Route.

> Note: the api has been redesigned from scratch to improve performance and modularity.

## Installation

```bash
npm install scene-router
```

## Usage

we recommended to use decorator. It makes the code a lot easier to maintain. If you don't want to use it, that's ok too.

with decorator

```js
@scene({
  path: "/home"
})
class MyView extends Component {
  render() {
    return (
      <View style={{
        backgroundColor: 'red',
        flex: 1,
        height: window.height,
        width: window.width
      }}/>
    )
  }
}

export default MyView
```

without decorator

```js
class MyView extends Component {
  render() {
    return (
      <View style={{
        backgroundColor: 'red',
        flex: 1,
        height: window.height,
        width: window.width
      }}/>
    )
  }
}

export default scene({ path: '/home' })(MyView)
```

# APIs

there are 4 things you need to know, `scene`, `Area`, `AreaList` and scene life cycle.

#### scene

`scene` is a decorator that register your component internally so the `Area` component can place it on screen.

Scene has the following `options` which can be configured at Component scope and Runtime scope


| option  | type | required | default value | scope |
| ------- | ---- | -------- | ------------- | ----- |
| path    | String  | Yes | N/A | Component Level only |
| side    | Side | No | Side.L | Component and Runtime Levels |
| threshold | Number | No | 50 | Component and Runtime Levels |
| gesture | Boolean | No | true | Component and Runtime Levels |
| reset | Boolean | No | false | Component and Runtime Levels |
| animate | Boolean | No | true | Component and Runtime Levels |
| backgroundColor | String | No | white | the back color of each scene |

Side: is a enum that has the following constant values

| name| description |
| --- | ----------- |
| L | Animate the Scene From Left to Right |
| R | Animate the Scene From Right to Left |
| T | Animate the Scene From Top to Bottom |
| B | Animate the Scene From Bottom to Top |

#### Scene Life Cycle

Once you connect your view with `scene` function, `scene` will inject a new props to your component with the name `sceneStatus`

`sceneStatus` can have one of the following values.

| value | Description |
| ----- | ----------- |
| Activating | when a scene is about to appears |
| Activated | when the animation is done and scene is visible |
| Deactivating | when a scene is about to go away or cover by another scene |
| Deactivated | when a scene is already covered or gone |
| MightDeactivate | during dragging a scene. the current scene will get this value |
| MightActivate | the previous and covered scene by current during dragging with get this value|

#### Area

Area is a component that needs to be places where you need to display the scene. This is the main component of `scene-router`

> if you are planning to use `AreaList`, make sure to pass a unique names to each `Area` components by `name` prop.

it has 2 main methods which can be accessed by `ref`

- goto(path, userOpts)

accepts a path and tries to find the scene related to that path. userOpts is an object contains 2 keys. `props` and `opts`. props the props that you want to send to your component. `opts` is the override values of value `options` which described in first table.

```js
this.refs['areaRef'].goto('/profile/123', { props:{}, opts: {side: Side.R }})
```

- goback(path)

simply returns to the previous scene. if `path` is provided, it goes back to that path.

if you want to `goback` to previous scene, don't provide any `path`.

if the path not found, the `goback` is noop.

#### AreaList

if you plan to implement tabs with scene-router, you should use `AreaList`. This component is wrapping all the `Area` component that you need and you can easily switch
between them by using `activeArea('name of area')`. Please refer to the example.

`AreaList` has all the methods of `Area` plus `activeArea`.

#### etc

for complex operation, `onGestureClosed` props is added to `Area` and `AreaList`. If user closes the scene by gesture, this callback is being called.

#### performance

in latest React-Native, `useNativeDrive` was introduced to boost performance. you can enable it by using `enableNativeDrive(true)`. This is a global set for all scenes.
the default value is `false`

```js
import { enableNativeDrive } from 'scene-router'

enableNativeDrive(true)
```

## Contributions

Please use it give us feedback and with help of you we can make it better.

Cheers.

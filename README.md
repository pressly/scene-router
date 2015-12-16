## SCENE-ROUTER

A complete scene routing library written in pure js for react native. It supports **iOS** and **Android**.

## Description
We, at [Pressly](https://pressly.com), love react-router so much that we miss it in React-Native world. So we decided to make one for react-native. I think if you already read this, I suggest don't stop reading and continue...

## Installation

```bash
npm install scene-router
```

## Usage

`scene-router` has a declarative way of defining scenes hierarchy. Each `Scene` tag defines a single path and component. Only the very first scene defines the initial path and initial props.

here's an example

```js
<Scene initialPath="/home" initialProps={{}}>
  <Scene path="home" component={Home}/>
  <Scene path="about" component={About}/>
</Scene>
```

in the above example, we are defining 2 scenes. As soon as you run the app, `Scene` will show you `Home` component.

### Transition

In order to transit between scene, `scene-router` exposes 2 simple method which they can be called by accessing to `Scene` object using `ref` props.

Here's an simple example

```js
class MyAwesomeApp extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    const scene = this.refs['sceneRef'];

    setTimeout(() => {
      scene.goto('/about');
    }, 2000);

    setTimoueout(() => {
      scene.goback();
    }, 4000);
  }

  render() {
    return (
      <Scene ref="sceneRef" initialPath="/home" initialProps={{}}>
        <Scene path="home" component={Home}/>
        <Scene path="about" component={About}/>
      </Scene>
    );
  }
}
```

so the above example transits to `About` component after 2 seconds and transits back to `Home` component after 2 seconds.

Don't worry about `goto` and `goback` we will talk about them in few mins.

##### goto

This method accepts 3 arguments. only the first one is required. As you already figured this out, it transits to specific route, defines in `Scene`'s
hierarchy.

So here's the method's definition:

```js
goto(path, props, options);
```

- path: must be string
- props: an object map of key values which needs to be passed to component
- options: an object defines how scene transits. at the moment option can have only 2 keys. `withAnimation` and `side`.
  - withAnimation: is a boolean value the default value is `true`. This flag enables animations between scenes.
  - side: is an enum which can be found in `scene-router` module as `SceneSide`. it can be accessed by `import { SceneSide } from 'scene-router';` The default value is `LEFT`. At the moment only 2 possible value is available. `LEFT` and `TOP`.


##### goback

this method remove the last scene and transit back to previous scene. It does not accept any arguments.

### LifeCycle

The power of `scene-router` comes with its life cycle system. The `scene-router` calls 4 new methods which can be implemented. These 4 methods are optional.

##### sceneWillFocus

this method will be called once a scene mounted and right before transition is start. Do not do heavy async calls here. it makes transition slow. Use it for small tasks.

##### sceneDidFocus

this method will be called once the transition is completed. This is a good time for you to do network call or heavy task.

##### sceneWillBlur

this method will be called once another scene is planned to be focused. It is a good practice to clean or remove unnecessary element from scene to make the transition as smooth as possible.

##### sceneDidBlur

this method will be called once transition is done and the scene is out of seen of user.


### Path

at the moment we are supporting query string and params in our path.

for example:

```js
<scene initialPath="/user/1?showAll=true">
  <scene path="user/:id" component={User}/>
</scene>
```

we are defining a route with variable params. and we navigate to that path with a new param, id, and query strings. All of these will be parsed and injected as `params` and `qs` props to `User` component.

This enables you to do `deeplinking` very easy and you can control where you want to go.


You can also do nesting scene as well.

```js
<scene initialPath="/user/1?showAll=true">
  <scene path="user/:id" component={User}>
    <scene path="setting" component={UserSetting}/>
  </scene>
</scene>
```

so now I can easily call `scenePush('/user/1/settings')` and go to user's setting scene.


## Contributions

please use it give us feedback and with help of you we can make it better.

cheers,

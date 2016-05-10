## SCENE-ROUTER

> version 0.3.7 and above are supporting ReactNative 0.25 and above

A complete scene routing library written in pure JavaScript for React Native. It supports **iOS** and **Android**.

## Description
We, at [Pressly](https://pressly.com), love react-router so much that we miss it in React Native world. So we decided to make one for react-native. I think if you already read this, I suggest don't stop reading and continue...

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

In order to transit between scene, `scene-router` exposes two simple methods which can be called by accessing the `Scene` object using `ref` props.

Here's a simple example:

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

    setTimeout(() => {
      scene.goback();
    }, 4000);
  }

  render() {
    return (
      <Scene ref="sceneRef" initialPath="/home" initialProps={{}} onSceneChange={({position, path}) => {
        console.log(position, path);
      }}>
        <Scene path="home" component={Home}/>
        <Scene path="about" component={About}/>
      </Scene>
    );
  }
}
```

The above example transits to `About` component after 2 seconds and transits back to `Home` component after 2 seconds.

Don't worry about `goto` and `goback` we will talk about them in few mins.

##### onSceneChange

This will be called once the scene is about to change. This is a good time to update any state in your main application such as `redux`. The callback function gets one argument, `event`, which contains `position` and `path`.

##### goto

This method accepts 3 arguments. Only the first one is required. As you already figured this out, it transits to specific route, defined in the `Scene`'s
hierarchy.

So here's the method's definition:

```js
goto(path, props, options);
```

- path: must be string
- props: an object map of key values which needs to be passed to component
- options: an object defines how scene transits. at the moment option can have only 2 keys. `withAnimation` and `side`.
  - duration: is an integer value in millisecond, defining animation's duration. Default value is 2000.
  - withAnimation: is a boolean value the default value is `true`. This flag enables animations between scenes.
  - side: is an enum which can be found in `scene-router` module as `SceneSide`. it can be accessed by `import { SceneSide } from 'scene-router';` The default value is `LEFT`. At the moment only 2 possible value is available. `LEFT` and `TOP`.
  - reset: is a boolean value. if it's true, it will clear scene stack. Reset stack will forces `withAnimation` to `false`.


##### goback

This method removes the last scene and transits back to the previous scene. It does not accept any arguments.

### LifeCycle

The power of `scene-router` comes with its life cycle system. The `scene-router` calls 4 new methods which can be implemented. These 4 methods are optional.

##### sceneWillFocus

This method will be called once a scene has mounted and right before a transition starts. Do not do use heavy async calls here. It makes transition slow. Use it for small tasks.

##### sceneDidFocus

This method will be called once the transition is completed. This is a good time for you to do network calls or heavy tasks.

##### sceneWillBlur

This method will be called once another scene is planned to be focused. It is a good practice to clean or remove unnecessary elements from the scene to make the transition as smooth as possible.

##### sceneDidBlur

This method will be called once the transition is done and the scene is not visible.


### Path

At the moment we are supporting query strings and params in our path.

For example:

```js
<Scene initialPath="/user/1?showAll=true">
  <Scene path="user/:id" component={User}/>
</Scene>
```

We define a route with variable params and navigate to that path with a new param, id, and query strings. All of these will be parsed and injected as `params` and `qs` props to `User` component.

This enables you to do `deeplinking` very easy and you can control where you want to go.


You can also nest `Scene`s as well.

```js
<Scene initialPath="/user/1?showAll=true">
  <Scene path="user/:id" component={User}>
    <Scene path="setting" component={UserSetting}/>
  </Scene>
</Scene>
```

So now we can easily call `scenePush('/user/1/settings')` and go to user's setting scene.


## Contributions

Please use it give us feedback and with help of you we can make it better.

Cheers.

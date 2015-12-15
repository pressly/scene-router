## SCENE-ROUTER

A complete scene routing library for react native, supports iOS and Android

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

#### Transition

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
  - withAnimation: is a boolean value by default is true and it tells the scene manager that you want to have an animation between scenes.
  - side: is an enum which can be found in `scene-router` module as `SceneSide`. it can be accessed by `import { SceneSide } from 'scene-router';`


##### goback

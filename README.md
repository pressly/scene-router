## SCENE-ROUTER

A complete scene routing library for react native

## Description
We, at [Pressly](https://pressly.com), love react-router so much that we miss it in React-Native world. So we decided to make one for react-native.
The doc will be updated soon, but for now, you can start off by looking at the `examples` folder.

## Installation

```bash
npm install scene-router
```

## Features

in version v0.2.0

#### Scene

Each Scene has the following new life cycle

- sceneWillFocus
- sceneDidFocus
- sceneWillBlur
- sceneDidBlur

#### Camera

There are two types of cameras

- Base camera
- Two side menu camera

##### Two side Menu Camera

Left and Right menu have 3 new life cycle

- menuMightOpen
- menuDidOpen
- menuDidClose

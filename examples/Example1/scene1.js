const React = require('react-native');
const scene = require('./scene');

const {
  Component
} = React;

@scene()
export default class Scene1 extends Component {
  constructor(props, context) {
    super(props, context)
  }

  onSceneActive(active) {

    active();
  }

  onSceneDeatcive() {

  }

  render() {

  }
}

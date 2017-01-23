

class History {
  
}

setSceneHistory()
setRouterHistory()

type GotoAction = {
  path: string,
  reset: boolean,
  props: any,
  side: 'static' | 'from-left' | 'from-right' | 'from-top' | 'from-bottom'
}

type GobackAction = {

}

type SectionAction = {
  name: string
}

type SceneEvent = {
  type: 'goto' | 'goback' | 'section',
  action: GotoAction | GobackAction | SectionAction
}

<Router 
  section={"feed"}
  onSceneChange={(sceneEvent) => {}}
  action={{
    type: 'goto',
    reset: false,
    path: "/user/1",
    props: {}
  }}
/>

@scene({
  path: '/feed',
  side: 'static',
  reset: false,
  gesture: false,
  threshold: 30,
  backgroundColor: 'white'
})
class FeedScene extends Component {
  constructor() {

  }

  onSceneStatusUpdate(status) {

  }

  render() {

  }
}


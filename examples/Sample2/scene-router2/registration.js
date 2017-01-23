
import route from 'trie-route'

let activeAreaName: string = ''
let areaMap: Map<string, any> = new Map()
let router = route.create()

export const processPath = (path: string, props: Object = {}, opts: Object = {}) => {
  const err = router.process(path, { props, opts })
  if (err) {
    console.log(err)
  }
}

export const setActiveAreaName = (activeAreaName: string) => {
  activeAreaName = activeAreaName
}

export const sceneRegister = (Scene: Function, path: string, reset: ?boolean = false) => {
  router.path(path, (params: any, qs: any, extra: any) => {
    // try to find the active area by name
    const activeArea = areaMap.get(activeAreaName)
    if (!activeArea) {
      throw new Error(`active area ${activeAreaName} not found`)
    }

    activeArea.goto(Scene, params, qs, extra)
  })
}

export const areaRegister = (name: string, area: any) => {
  areaMap.set(name, area)
}

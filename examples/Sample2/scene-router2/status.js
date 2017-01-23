
export type StatusType 
  = 'might:activate'
  | 'will:activate'
  | 'did:activate'
  | 'might:deactivate'
  | 'will:deactivate'
  | 'did:deactivate'

export const Status = {
  SceneMightActivate:    'might:activate',
  SceneWillActivate:     'will:activate',
  SceneDidActivate:      'did:activate',
  SceneMightDeactivate:  'might:deactivate',
  SceneWillDeactivate:   'will:deactivate',
  SceneDidDeactivate:    'did:deactivate'
}
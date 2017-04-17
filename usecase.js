gotoScene({
  path: '/login',
  animationFn: Side.FromLeft(AnimationFn.FadeIn) || AnimationFn.FadeIn()
})

transforms <- Animated.ValueXY
opacity <- Animated.Value


const FadeIn = (options) => () => {
  return {
    setup: () => {
      return {
        transforms: 0,
        opacity: 0
      }
    },
    animation: (curr, next) => {

    },
    
  }
}

const FromLeft = (fn) => {
  return fn({ from: 'left' })
}



class AnimatedSceneWrapper {
  return (
    <Animated.View>
      {this.props.children}
    </Animated.View>
  )
}






fn => () => () => {}

var compose = function(f, g) {
    return function() {
        return f.call(this, g.apply(this, arguments));
    };
};

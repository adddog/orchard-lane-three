import Scene from "./lib/"

const ThreeScene = (videoEl, targetEl, options = {}) => {

  const scene = new Scene(
    videoEl,
    targetEl || document.body,
    options
  )
/*
  S.start()

  const { scene } = S.renderingContext
*/
  function start() {
    scene.start()
  }

  return {
    start:start,
    scene:scene
  }
}

export default ThreeScene
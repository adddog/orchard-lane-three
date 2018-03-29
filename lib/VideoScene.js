import createStore from "./data/store"
import RenderingContext from "./utils/RenderingContext"
import ContainerModel from "./models/ContainerModel"
import Heading from "./controls/heading"
import ObjectPicker from "./utils/ObjectPicker"
import VideoBackdrop from "./models/VideoBackdrop"
import Hotspots from "./models/Hotspots"
import createLoop from "raf-loop"
import { autobind } from "core-decorators"
import { setInitialConfig,updateConfig } from "./data/actions/configurationActions"
import { setPlaybackTime } from "./data/actions/sceneActions"
import ExternalEventEmitter from "./events/ExternalEventEmitter"
import * as EventTypes from "./events/eventTypes"

export default class VideoScene {
    constructor(videoEl, containerEl, config = {}) {
        this.config = config
        this.store = createStore()
        this.videoEl = videoEl
        this.renderBound = this.render.bind(this)
        this.containerEl = containerEl
        this.renderingContext = this.createRenderingContext(config)
        this.videoEl.addEventListener(
            "timeupdate",
            this.onVideoPlayerUpdate
        )
        this.store.dispatch(setInitialConfig(config))
        this.hotspots = new Hotspots(this.store)
        this.heading = new Heading(this.containerDiv, this.store)
        this.globalEmitter = new ExternalEventEmitter()
        this._events = {
            render: [],
        }
    }

    @autobind
    onVideoPlayerUpdate(e) {
        this.store.dispatch(
            setPlaybackTime(this.videoEl.currentTime * 1000)
        )
    }

    updateConfig(config) {
        this.store.dispatch(updateConfig(config))
    }

    setHandlers(handlers = {}) {
        this.globalEmitter.clearObservers()
        if (handlers.onWallClicked) {
            this.globalEmitter.addObserver(
                EventTypes.WALL_CLICKED,
                data => handlers.onWallClicked(data)
            )
        }
        if (handlers.cameraRotation) {
            this.globalEmitter.addObserver(
                EventTypes.CAMERA_ROTATION,
                data => handlers.cameraRotation(data)
            )
        }
        if (handlers.screenShot) {
            this.globalEmitter.addObserver(
                EventTypes.SCENE_SCREEN_SHOT,
                data => handlers.screenShot(data)
            )
        }
        this.globalEmitter.addObserver(
            EventTypes.HOTSPOT_MOUSE_OVER,
            () => this.setItemHovered(true)
        )
        this.globalEmitter.addObserver(
            EventTypes.HOTSPOT_MOUSE_OUT,
            () => this.setItemHovered(false)
        )
    }

    setItemHovered(hovering) {
        if (hovering) {
            this.containerDiv.className = `${this.defaultClasses} `
        } else {
            this.containerDiv.className = this.defaultClasses
        }
    }

    get defaultClasses() {
        return `video-scene-container`
    }

    createRenderingContext(config) {
        const containerDiv = document.createElement("div")
        containerDiv.style.position = "absolute"
        containerDiv.style.top = "0"
        containerDiv.style.left = "0"
        containerDiv.style.width = "100%"
        containerDiv.style.height = "100%"
        containerDiv.style.cursor = "move"
        containerDiv.style.cursor = "grab"
        containerDiv.className = this.defaultClasses
        if (config.insertBefore) {
            this.containerEl.insertBefore(
                containerDiv,
                this.containerEl.childNodes[0]
            )
        } else {
            this.containerEl.appendChild(containerDiv)
        }
        this.containerDiv = containerDiv

        return new RenderingContext(containerDiv, this.store, config)
    }

    createModelContext() {
        return {
            globalEmitter: this.globalEmitter,
            renderingContext: this.renderingContext,
            store: this.store,
        }
    }

    initialize() {
        if (!this.initialized) {
            const { scene } = this.renderingContext
            this.baseContainer = new ContainerModel()
            const context = this.createModelContext()
            this.baseContainer.setContext(context)
            this.hotspots.setContext(context)

            if (!this.config.hide) {

                this.videoBackdrop = new VideoBackdrop({
                    videoEl: this.videoEl,
                })

                this.baseContainer.addChild(this.videoBackdrop)
            }

            scene.add(this.baseContainer.object3D)
            this.initialized = true

            this.objectPicker = new ObjectPicker(
                this.renderingContext,
                context
            )
        }
    }

    on(str, cb) {
        this._events[str] = this._events[str] || []
        this._events[str].push(cb)
    }

    off(str, cb) {
        this._events[str].splice(this._events[str].indexOf(cb), 1)
    }

    pause() {
        if (this.loop) {
            this.loop.stop()
            this.loop = null
        }
    }

    resume() {
        this.pause()
        this.loop = createLoop(this.renderBound)
        this.loop.start()
    }

    start() {
        this.initialize()
        this.resume()
    }

    resize() {
        if (this.renderingContext) {
            this.renderingContext.resize()
        }
    }

    render(time) {
        this.baseContainer.onBeforeFrameRendered()
        this._events.render.forEach(cb => cb(time))
        this.renderingContext.render()
        this.baseContainer.onAfterFrameRendered()
    }

    destroy() {
        this.videoEl.removeEventListener(
            "timeupdate",
            this.onVideoPlayerUpdate
        )
        this.pause()
        this.heading.destroy()
        this.baseContainer.destroy()
        this.objectPicker.destroy()
        this.renderingContext.destroy()
        this.containerEl.removeChild(this.containerDiv)
        this.renderingContext = null
    }
}

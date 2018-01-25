import * as THREE from "three"
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    OrthographicCamera,
} from "three"
import Controls from "../controls/Orbit"
import Device from "./Device"
import { THEATER_RADIUS, CAMERA_FOV,RENDER_DISTANCE } from "../data/constants"

export class RenderingContext {
    constructor(containerElement, dataStore, config = {}) {
        this.containerElement = containerElement
        const width = this.width
        const height = this.height

        this.scene = new Scene()
        this.camera = new PerspectiveCamera(
            CAMERA_FOV,
            width / height,
            0.01,
            RENDER_DISTANCE
        )
        //const orbitControls = OrbitControls(THREE)
        //var controls = new orbitControls(this.camera, document.body)
        this.renderer = new WebGLRenderer({
            antialias: !Device.isMobileSafari,
        })

        this.renderer.setPixelRatio(
            Math.min(1.5, window.devicePixelRatio)
        )
        this.renderer.setSize(width, height)
        this.renderer.autoClear = false
        this.renderer.setClearColor(0x000000, 1)

        this.controls = new Controls(
            this.camera,
            this.renderer.domElement,
            dataStore
        )

        this.containerElement.appendChild(this.renderer.domElement)

        this.resizeBound = this.resize.bind(this)
        window.addEventListener("resize", this.resizeBound)
        window.addEventListener("orientationchange", this.resizeBound)

        this.resize()
    }

    static createDefault(containerElement, dataStore, config = {}) {
        return new RenderingContext(
            containerElement,
            dataStore,
            config
        )
    }

    set position(p){
        this.controls.target.set(p.x, p.y, p.z)
        this.controls.target.y =
        //this.camera.position.set(p.x, p.y, p.z)
        console.log(this.controls);
        console.log(this.camera);
    }

    get width() {
        return this._width || this.containerElement.offsetWidth
    }

    get height() {
        return this._height || this.containerElement.offsetHeight
    }

    set width(w) {
        this._width = w
    }

    set height(h) {
        this._height = h
    }

    takeScreenshot() {
        this.render()
        const q = Device.isMobile ? "image/jpeg" : "image/png"
        return this.renderer.domElement.toDataURL(q)
    }

    resize(e) {
        const width = this.containerElement.offsetWidth
        const height = this.containerElement.offsetHeight

        if (this._width !== width || this._height !== height) {
            this.width = width
            this.height = height

            this.camera.aspect = this.width / this.height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(this.width, this.height)
        }
    }

    render() {
        this.renderer.clear()
        this.resize()
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }

    destroy() {
        window.removeEventListener("resize", this.resizeBound)
        window.removeEventListener(
            "orientationchange",
            this.resizeBound
        )
        this.controls.destroy()
        this.renderer.dispose()
    }
}

export default RenderingContext

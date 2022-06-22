import { Component } from "../core";
import { PerspectiveCamera } from "three";

export default class Camera implements Component {
    public id = 'camera' as const;
    public camera: PerspectiveCamera;

    constructor(camera: PerspectiveCamera) {
        this.camera = camera;
    }
}
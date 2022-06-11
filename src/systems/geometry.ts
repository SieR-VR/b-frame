import { Entity, System } from "../core";
import Camera from "../components/camera";
import Transform from "../components/transform";

export default class GeometrySystem extends System<[Camera, Transform]> {
    update(context: any, target: Entity<[Camera, Transform]>): void {
        
    }
}
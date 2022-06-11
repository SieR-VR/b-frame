import { Matrix4 } from 'three';
import { Component } from "../core";

export default class Transform implements Component {
    public id = 'transform' as const;
    public transform: Matrix4 = new Matrix4();
}
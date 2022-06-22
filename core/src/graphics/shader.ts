import * as THREE from 'three';
import { Parser } from 'acorn';

type ScalarTypes = 'int' | 'bool' | 'float' | 'uint';

type VectorTypes = 'vec2' | 'vec3' | 'vec4' |
    'ivec2' | 'ivec3' | 'ivec4' |
    'bvec2' | 'bvec3' | 'bvec4' |
    'uvec2' | 'uvec3' | 'uvec4';
type MatrixTypes = 'mat2' | 'mat3' | 'mat4' |
    'mat2x2' | 'mat2x3' | 'mat2x4' |
    'mat3x2' | 'mat3x3' | 'mat3x4' |
    'mat4x2' | 'mat4x3' | 'mat4x4';

type GLSLTypes = ScalarTypes | VectorTypes;

type ThreeTypes = {
    'int': number;
    'bool': boolean;
    'float': number;
    'uint': number;

    'vec2': THREE.Vector2;
    'vec3': THREE.Vector3;
    'vec4': THREE.Vector4;

    'ivec2': THREE.Vector2;
    'ivec3': THREE.Vector3;
    'ivec4': THREE.Vector4;

    'bvec2': THREE.Vector2;
    'bvec3': THREE.Vector3;
    'bvec4': THREE.Vector4;

    'uvec2': THREE.Vector2;
    'uvec3': THREE.Vector3;
    'uvec4': THREE.Vector4;
}

interface BasicUniform<T extends GLSLTypes> {
    glslType: T;
    value: ThreeTypes[T];
}

interface Uniforms {
    [key: string]: BasicUniform<GLSLTypes>;
}

export abstract class Shader {
    uniforms: Uniforms = {};
}

const unifrom: Uniforms = {
    wasans: {
        glslType: 'bool',
        value: true,
    }
}

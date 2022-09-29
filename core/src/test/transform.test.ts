import * as path from 'path';

import { Entity, Component } from "../core";
import transformSource from "../core/transform";

describe("Transform", () => {
    test("Transform", () => {
        const result = transformSource([path.join(__dirname, 'ecs.test.ts')], {});
    });
})
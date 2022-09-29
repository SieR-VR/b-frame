import { Entity, Component } from "../core";
import transformSource from "../core/transform";

describe("Transform", () => {
    test("Transform", () => {
        const source = `
            class TestComponent implements Component {
                id: "TestComponent" = "TestComponent";
            }

            class TestEntity extends Entity<[TestComponent]> {
                constructor(id: string) {
                    super(id, {
                        TestComponent: new TestComponent(),
                    });
                }
            }

            class TestSystem extends System<TestComponent> {
                update() {
                    console.log("TestSystem update");
                }
            }
        `;

        const result = transformSource(source);

        console.log(result);
    });
})
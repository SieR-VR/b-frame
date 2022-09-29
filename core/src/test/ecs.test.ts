import { World, System, Entity, Component } from '../core';

describe('ECS', () => {
    test('ECS', () => {
        const world = new World();

        class TestComponent implements Component {
            id = 'TestComponent';
            name: string = '';

            constructor(name: string) {
                this.name = name;
            }
        }

        class TestSystem extends System<TestComponent> {
            update() {
                console.log('TestSystem update');
            }
        }

        class TestEntity extends Entity<[TestComponent]> {}

        world.registerSystem(new TestSystem(1));
        world.registerEntity(new TestEntity("test"));

        world.update({});
    })
})
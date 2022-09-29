import { World, System, Entity, Component } from '../core';

describe('ECS', () => {
    test('ECS', () => {
        const world = new World();

        class TestComponent implements Component {
            id: 'test' = 'test';
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

        const testEntity: Entity<[TestComponent]> = {
            id: 'test',
            test: new TestComponent('test'),
        };

        world.registerSystem(new TestSystem(1));
        world.registerEntity(testEntity);

        world.update({});
    })
})
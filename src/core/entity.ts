import Component from "./component";
import World from "./world";

export type EntityID = string;

export default abstract class Entity<T extends Component[]> {
    id: EntityID;
    components: EntityMatches<T>;

    constructor(world: World, id: EntityID, components: EntityMatches<T>) {
        this.id = id;
        this.components = components;

        world.registerEntity(this);
    }
}

type Filter<C extends Component, K> = C extends { id: K } ? C : never;
type EntityMatches<T extends Component[]> = {
    [K in T[number]['id']]: Filter<T[number], K>
}
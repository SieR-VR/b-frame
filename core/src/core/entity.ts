import Component from "./component";
import World from "./world";

export type EntityID = string;

export default abstract class Entity<T extends Component[]> {
    id: EntityID;
    static components: string[] = [];

    constructor(id: EntityID) {
        this.id = id;
    }
}
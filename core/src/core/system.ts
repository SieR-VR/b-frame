import Component from "./component";
import { Entity } from "./entity";

export type SystemPriority = number;

export default abstract class System<T extends Component> {
    priority: SystemPriority;
    __component: string = "";
    watch_entities: Entity<(T | Component)[]>[] = [];

    constructor(priority: SystemPriority) {
        this.priority = priority;
    }

    _update(context: any): void {
        this.watch_entities.forEach((entity) => {
            this.update(context, entity);
        });
    }
    
    abstract update(context: any, target: Entity<(T | Component)[]>): void;
}
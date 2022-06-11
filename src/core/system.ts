import Component from "./component";
import Entity from "./entity";

export type SystemPriority = number;

export default abstract class System<T extends Component[]> {
    priority: SystemPriority;
    watch_traits: WatchTraits<T>;

    constructor(priority: SystemPriority, watch_traits: WatchTraits<T>) {
        this.priority = priority;
        this.watch_traits = watch_traits;
    }

    _update(context: any, entity: Entity<any>): void {
        if (this.watch_traits.every(trait => trait in entity.components)) {
            this.update(context, entity);
        }
    }
    
    abstract update(context: any, target: Entity<T>): void;
}

export type WatchTraits<T extends Component[]> = {
    [K in keyof T]: T[K]['id'];
};

import Component from "./component";
import Entity from "./entity";

export type SystemPriority = number;

export default abstract class System<T extends Component[]> {
    priority: SystemPriority;
    watch_traits: WatchTraits<T>;
    watch_entities: Entity<T>[] = [];

    constructor(priority: SystemPriority, watch_traits: WatchTraits<T>) {
        this.priority = priority;
        this.watch_traits = watch_traits;
    }

    _update(context: any): void {
        this.update(context, this.watch_entities);
    }
    
    abstract update(context: any, target: Entity<T>[]): void;
}

export type WatchTraits<T extends Component[]> = {
    [K in keyof T]: T[K]['id'];
};

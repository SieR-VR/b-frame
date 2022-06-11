import Entity, { EntityID } from "./entity";
import Component from "./component";
import System, { SystemPriority } from "./system";
import { EventManager } from "./event";

export default class World {
    private systems: Map<SystemPriority, System<Component[]>> = new Map();
    private entities: Map<EntityID, Entity<Component[]>> = new Map();

    public EventManager: EventManager = new EventManager();

    registerSystem(system: System<Component[]>): void {
        if (this.systems.has(system.priority)) {
            throw new Error(`System with priority ${system.priority} already exists.`);
        }

        this.systems.set(system.priority, system);
    }

    unregisterSystem(system: System<Component[]>): void {
        if (!this.systems.has(system.priority)) {
            throw new Error(`System with priority ${system.priority} does not exist.`);
        }

        this.systems.delete(system.priority);
    }

    registerEntity(entity: Entity<Component[]>): void {
        if (this.entities.has(entity.id)) {
            throw new Error(`Entity with id ${entity.id} already exists.`);
        }

        this.entities.set(entity.id, entity);
    }

    unregisterEntity(entity: Entity<Component[]>): void {
        if (!this.entities.has(entity.id)) {
            throw new Error(`Entity with id ${entity.id} does not exist.`);
        }

        this.entities.delete(entity.id);
    }

    update(context: any): void {
        for (const system of this.systems.values()) {
            for (const entity of this.entities.values()) {
                system._update(context, entity);
            }
        }
    }
}
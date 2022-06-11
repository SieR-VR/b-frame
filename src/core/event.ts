export type EventID = string;

export default interface Event {
    id: EventID;
}

export class EventManager {
    subscribers: Map<EventID, Set<(context: any, event: any) => void>>;

    constructor() {
        this.subscribers = new Map<EventID, Set<(context: any, event: Event) => void>>();
    }

    subscribe<T extends Event, K = T["id"]>(event: K extends string ? K : string, callback: (context: any, event: T) => void): void {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set<(context: any, event: T) => void>([callback]));
        }
        else {
            this.subscribers.get(event)!.add(callback);
        }
    }

    unsubscribe<T extends Event, K = T["id"]>(event: K extends string ? K : string, callback: (context: any, event: T) => void): void {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event)!.delete(callback);
        }
        else {
            throw new Error(`No subscribers for event ${event}`);
        }
    }
}
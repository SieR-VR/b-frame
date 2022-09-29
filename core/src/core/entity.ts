import Component from "./component";

export type EntityID = string;

export type Entity<T extends Component[]> = {
    id: EntityID;
} & {
    [K in keyof T as T[number]["id"]]: T[number];
};
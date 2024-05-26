import { Action as IAction, Device } from "@mkellsy/hap-device";

export interface Action {
    button: string;

    action(state: IAction, devices: Map<string, Device>, activate: () => void): void;
}

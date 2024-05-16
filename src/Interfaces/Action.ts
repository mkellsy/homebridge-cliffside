import { Action as IAction, Device as IDevice } from "@mkellsy/hap-device";

export interface Action {
    button: string;

    action(state: IAction, devices: Map<string, IDevice>): void;
}

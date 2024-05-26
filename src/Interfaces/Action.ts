import { Action as IAction, Device, DeviceState } from "@mkellsy/hap-device";

export interface Action {
    button: string;

    action(state: IAction, devices: Map<string, Device>, led: (state: Partial<DeviceState>) => void): void;
}

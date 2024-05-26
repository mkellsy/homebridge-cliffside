import * as Interfaces from "@mkellsy/hap-device";

export interface Action {
    button: string;

    action(
        device: Interfaces.Device,
        button: Interfaces.Button,
        state: Interfaces.Action,
        devices: Map<string, Interfaces.Device>,
    ): void;
}

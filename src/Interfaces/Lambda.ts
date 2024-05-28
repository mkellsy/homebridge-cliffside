import * as Interfaces from "@mkellsy/hap-device";

export interface Lambda {
    button: string;

    action(
        button: Interfaces.Button,
        state: Interfaces.Action,
        devices: Map<string, Interfaces.Device>,
    ): void;
}

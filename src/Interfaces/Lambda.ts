import * as Interfaces from "@mkellsy/hap-device";

export interface Lambda {
    button: string;

    action(
        button: Interfaces.Button,
        action: Interfaces.Action,
        devices: Map<string, Interfaces.Device>,
    ): PromiseLike<void>;
}

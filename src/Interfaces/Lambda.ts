import * as Interfaces from "@mkellsy/hap-device";

export interface Lambda {
    button?: string;
    timeclock?: string;

    update?(
        device: Interfaces.Device,
        state: Interfaces.DeviceState,
        devices: Map<string, Interfaces.Device>,
    ): PromiseLike<void>;

    action?(
        button: Interfaces.Button,
        action: Interfaces.Action,
        devices: Map<string, Interfaces.Device>,
    ): PromiseLike<void>;
}

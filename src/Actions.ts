import Fs from "fs";
import Os from "os";
import Path from "path";

import { Action } from "./Interfaces/Action";
import { Action as IAction, Button, Device, DeviceType } from "@mkellsy/hap-device";

const CONTROLLABLE_TYPES = [
    DeviceType.Contact,
    DeviceType.Dimmer,
    DeviceType.Fan,
    DeviceType.Shade,
    DeviceType.Strip,
    DeviceType.Switch
];

export class Actions {
    private devices: Map<string, Device> = new Map();
    private actions: Map<string, Action> = new Map();

    constructor() {
        const directory = Path.join(Os.homedir(), "house");

        if (Fs.existsSync(directory)) {
            Fs.readdirSync(directory).forEach((item) => {
                const filename = Path.join(directory, item);
                const file = Fs.statSync(Path.join(directory, item));

                if (file.isFile() && Path.extname(filename) === ".js") {
                    const action = require(filename);

                    if (action != null && Array.isArray(action)) {
                        for (const item of action) {
                            if (item.button != null) {
                                this.actions.set(item.button, item);
                            }
                        }
                    } else if (action != null && typeof action === "object" && action.button != null) {
                        this.actions.set(action.button, action);
                    }
                }
            });
        }
    }

    public emit(button: Button, state: IAction): void {
        const action = this.actions.get(button.id);

        if (action != null) {
            action.action(state, this.devices);
        }
    }

    public has(button: string): boolean {
        return this.actions.has(button);
    }

    public get(button: string): Action | undefined {
        return this.actions.get(button);
    }

    public set(device: Device): void {
        if (CONTROLLABLE_TYPES.indexOf(device.type) === -1) {
            return;
        }

        this.devices.set(device.id, device);
    }
}

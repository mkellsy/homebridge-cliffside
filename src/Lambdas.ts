import * as Interfaces from "@mkellsy/hap-device";

import Fs from "fs";
import Os from "os";
import Path from "path";

import { Lambda } from "./Interfaces/Lambda";
import { Logging } from "homebridge";

const CONTROLLABLE_TYPES = [
    Interfaces.DeviceType.Contact,
    Interfaces.DeviceType.Dimmer,
    Interfaces.DeviceType.Fan,
    Interfaces.DeviceType.Keypad,
    Interfaces.DeviceType.Shade,
    Interfaces.DeviceType.Strip,
    Interfaces.DeviceType.Switch
];

export class Lambdas {
    private readonly log: Logging;

    private devices: Map<string, Interfaces.Device> = new Map();
    private lambdas: Map<string, Lambda> = new Map();

    constructor(log: Logging) {
        this.log = log;

        const directory = Path.join(Os.homedir(), "house");

        this.log.debug(`Loading Lambdas ${directory}`);

        if (Fs.existsSync(directory)) {
            Fs.readdirSync(directory).forEach((item) => {
                const filename = Path.join(directory, item);
                const file = Fs.statSync(Path.join(directory, item));

                if (file.isFile() && Path.extname(filename) === ".js") {
                    const action = require(filename);

                    this.log.debug(`Lambda Found ${filename}`);

                    if (action != null && Array.isArray(action)) {
                        for (const item of action) {
                            if (item.button != null) {
                                this.lambdas.set(item.button, item);
                            }
                        }
                    } else if (action != null && typeof action === "object" && action.button != null) {
                        this.lambdas.set(action.button, action);
                    }
                }
            });
        }
    }

    public emit(button: Interfaces.Button, state: Interfaces.Action): void {
        const action = this.lambdas.get(button.id);

        if (action != null) {
            action.action(button, state, this.devices);
        }
    }

    public has(button: string): boolean {
        return this.lambdas.has(button);
    }

    public get(button: string): Lambda | undefined {
        return this.lambdas.get(button);
    }

    public set(device: Interfaces.Device): void {
        if (CONTROLLABLE_TYPES.indexOf(device.type) === -1) {
            return;
        }

        this.devices.set(device.id, device);
    }
}

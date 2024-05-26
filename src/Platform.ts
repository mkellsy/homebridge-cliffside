import * as Baf from "@mkellsy/baf-client";
import * as Leap from "@mkellsy/leap-client";
import * as Interfaces from "@mkellsy/hap-device";

import { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from "homebridge";

import { Accessories } from "./Accessories";
import { Actions } from "./Actions";
import { Device } from "./Interfaces/Device";
import { System } from "./Interfaces/System";

import { defaults } from "./Interfaces/Config";

const accessories: Map<string, PlatformAccessory> = new Map();
const devices: Map<string, Device> = new Map();

const platform: string = "Cliffside";
const plugin: string = "@mkellsy/homebridge-cliffside";

export { accessories, devices, platform, plugin };

export class Platform implements DynamicPlatformPlugin {
    private readonly actions: Actions;

    private readonly log: Logging;
    private readonly config: PlatformConfig;
    private readonly homebridge: API;

    constructor(log: Logging, config: PlatformConfig, homebridge: API) {
        this.actions = new Actions(log);

        this.log = log;
        this.config = { ...defaults, ...config };
        this.homebridge = homebridge;

        this.homebridge.on("didFinishLaunching", () => {
            Leap.connect()
                .on("Available", (devices) => this.onAvailable(System.leap, devices))
                .on("Action", (device, button, action) => this.onAction(device, button, action))
                .on("Update", (device, state) => this.onUpdate(device, state));

            Baf.connect()
                .on("Available", (devices) => this.onAvailable(System.baf, devices))
                .on("Update", (device, state) => this.onUpdate(device, state));

        });
    }

    public configureAccessory(accessory: PlatformAccessory): void {
        accessories.set(accessory.UUID, accessory);
    }

    private onAvailable = (system: System, devices: Interfaces.Device[]): void => {
        for (const device of devices) {
            const accessory = Accessories.create(system, this.homebridge, device, this.config, this.log);

            accessory?.register();

            if (accessory == null) {
                Accessories.remove(this.homebridge, device);
            }

            this.actions.set(device);
        }
    };

    private onAction = (device: Interfaces.Device, button: Interfaces.Button, action: Interfaces.Action): void => {
        const accessory = Accessories.get(this.homebridge, device);

        this.actions.emit(device, button, action);

        if (accessory == null || accessory.onAction == null) {
            return;
        }

        accessory.onAction(button, action);
    };

    private onUpdate = (device: Interfaces.Device, state: Interfaces.DeviceState): void => {
        const accessory = Accessories.get(this.homebridge, device);

        if (accessory == null || accessory.onUpdate == null) {
            return;
        }

        accessory.onUpdate(state);
    };
}

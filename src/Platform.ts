import * as Baf from "@mkellsy/baf-client";
import * as Leap from "@mkellsy/leap-client";
import * as Interfaces from "@mkellsy/hap-device";

import { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from "homebridge";

import { Accessories } from "./Accessories";
import { Device } from "./Interfaces/Device";

import { links } from "./Links";

const accessories: Map<string, PlatformAccessory> = new Map();
const discovered: Map<string, Interfaces.Device> = new Map();
const devices: Map<string, Device> = new Map();

const platform: string = "Cliffside";
const plugin: string = "@mkellsy/homebridge-cliffside";

export { accessories, devices, platform, plugin };

export class Platform implements DynamicPlatformPlugin {
    private readonly log: Logging;
    private readonly homebridge: API;

    constructor(log: Logging, _config: PlatformConfig, homebridge: API) {
        this.log = log;
        this.homebridge = homebridge;

        this.homebridge.on("didFinishLaunching", () => {
            Leap.connect().on("Available", this.onAvailable).on("Action", this.onAction).on("Update", this.onUpdate);
            Baf.connect().on("Available", this.onAvailable).on("Update", this.onUpdate);
        });
    }

    public configureAccessory(accessory: PlatformAccessory): void {
        accessories.set(accessory.UUID, accessory);
    }

    private onAvailable = (devices: Interfaces.Device[]): void => {
        for (const device of devices) {
            const accessory = Accessories.create(this.homebridge, device, this.log);

            discovered.set(device.id, device);
            accessory?.register();

            this.log.debug(`${device.type} available ${device.name}`);

            if (accessory == null) {
                Accessories.remove(this.homebridge, device);
            }
        }
    };

    private onAction = (device: Interfaces.Device, button: Interfaces.Button, action: Interfaces.Action): void => {
        const accessory = Accessories.get(this.homebridge, device);

        if (accessory == null || accessory.onAction == null) {
            return;
        }

        accessory.onAction(button, action);
    };

    private onUpdate = (device: Interfaces.Device, state: Interfaces.DeviceState): void => {
        const accessory = Accessories.get(this.homebridge, device);
        const linked = discovered.get(links.get(device.id) || "");

        if (linked != null) {
            linked.set(state);
        }

        if (accessory == null || accessory.onUpdate == null) {
            return;
        }

        accessory.onUpdate(state);
    };
}

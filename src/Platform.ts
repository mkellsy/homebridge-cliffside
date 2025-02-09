import { execSync } from "child_process";

import * as Baf from "@mkellsy/baf-client";
import * as Leap from "@mkellsy/leap-client";
import * as Interfaces from "@mkellsy/hap-device";

import { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from "homebridge";

import { Accessories } from "./Accessories";
import { Device } from "./Device";
import { Links } from "./Links";

const accessories: Map<string, PlatformAccessory> = new Map();
const devices: Map<string, Device> = new Map();

const platform: string = "Cliffside";
const plugin: string = "@mkellsy/homebridge-cliffside";

export { accessories, devices, platform, plugin };

/**
 * Impliments a Homebridge platform plugin.
 * @private
 */
export class Platform implements DynamicPlatformPlugin {
    private readonly log: Logging;
    private readonly homebridge: API;
    private readonly links: Links;

    private leap?: Leap.Client;
    private baf?: Baf.Client;

    /**
     * Creates an instance to this plugin.
     *
     * @param log A reference to the Homebridge logger.
     * @param config A reference to this plugin's config.
     * @param homebridge A reference to the Homebridge API.
     */
    constructor(log: Logging, config: PlatformConfig, homebridge: API) {
        this.log = log;
        this.homebridge = homebridge;
        this.links = new Links();

        if (config._bridge?.port != null) {
            execSync(`lsof -t -i tcp:${config._bridge.port} | xargs kill -9`);
        }

        this.homebridge.on("didFinishLaunching", () => {
            this.leap = Leap.connect()
                .on("Available", this.onAvailable)
                .on("Action", this.onAction)
                .on("Update", this.onUpdate);
            this.baf = Baf.connect().on("Available", this.onAvailable).on("Update", this.onUpdate);
        });
    }

    /**
     * Function to call when Homebridge findes a cached accessory that is
     * associated to this plugin.
     *
     * Note these accessories do not have extended data, the plugin wwill need
     * to re-initialize the device, and re-bind any listeners.
     *
     * @param accessory A reference to the cached accessory.
     */
    public configureAccessory(accessory: PlatformAccessory): void {
        accessories.set(accessory.UUID, accessory);
    }

    /*
     * mDNS discovery listener. This will create devices when found and will
     * register with Homebridge or re-initialize the accessory if it is from
     * the cache.
     */
    private onAvailable = (devices: Interfaces.Device[]): void => {
        for (const device of devices) {
            const accessory = Accessories.create(this.homebridge, device, this.log);

            this.links.set(device);
            accessory?.register();

            this.log.debug(`${device.type} available ${device.name}`);

            if (accessory == null) {
                Accessories.remove(this.homebridge, device);
            }
        }
    };

    /*
     * Button action listener. This recieves button actions from remotes and
     * keypads, then relays the action to Homebridge.
     */
    private onAction = (device: Interfaces.Device, button: Interfaces.Button, action: Interfaces.Action): void => {
        const accessory = Accessories.get(this.homebridge, device);

        if (accessory == null || accessory.onAction == null) {
            return;
        }

        accessory.onAction(button, action);
    };

    /*
     * Device update listener. This recieves updates from the devices and will
     * relay the state to Homebridge.
     */
    private onUpdate = (device: Interfaces.Device, status: Interfaces.DeviceState): void => {
        const accessory = Accessories.get(this.homebridge, device);

        this.links.update(device, status);

        if (accessory == null || accessory.onUpdate == null) {
            return;
        }

        accessory.onUpdate(status);
    };
}

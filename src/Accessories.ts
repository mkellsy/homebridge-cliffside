import * as Baf from "@mkellsy/baf-client";
import * as Leap from "@mkellsy/leap-client";

import { API, Logging } from "homebridge";
import { DeviceType, Device as IDevice } from "@mkellsy/hap-device";

import { accessories, devices, platform, plugin } from "./Platform";

import { Fan } from "./Fan";
import { Humidity } from "./Humidity";
import { Keypad } from "./Keypad";
import { Occupancy } from "./Occupancy";
import { Strip } from "./Strip";
import { Temperature } from "./Temperature";
import { Timeclock } from "./Timeclock";

import { Device } from "./Device";
import { System, parseSystem } from "./System";

/**
 * Accessory factory.
 * @private
 */
export abstract class Accessories {
    /**
     * Creates respective devices from a common device discovery.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the common device object.
     * @param config A reference to the plugin configuration.
     * @param log A reference to the Homebridge logger.
     *
     * @returns A device or undefined if not configured.
     */
    public static create(homebridge: API, device: IDevice, log: Logging): Device | undefined {
        const system: System = parseSystem(device);

        switch (device.type) {
            case DeviceType.Fan:
                if (system !== System.baf) {
                    return undefined;
                }

                return new Fan(homebridge, device as Baf.Fan, log);

            case DeviceType.Humidity:
                return new Humidity(homebridge, device as Baf.Humidity, log);

            case DeviceType.Keypad:
                return new Keypad(homebridge, device as Leap.Keypad, log);

            case DeviceType.Occupancy:
                return new Occupancy(homebridge, device as Leap.Occupancy, log);

            case DeviceType.Remote:
                return new Keypad(homebridge, device as Leap.Keypad, log);

            case DeviceType.Strip:
                return new Strip(homebridge, device as Leap.Strip, log);

            case DeviceType.Temperature:
                return new Temperature(homebridge, device as Baf.Temperature, log);

            case DeviceType.Timeclock:
                return new Timeclock(homebridge, device as Leap.Timeclock, log);
        }

        return undefined;
    }

    /**
     * Fetches an internally cached device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the common device object.
     *
     * @returns The cached device or undefined if not available.
     */
    public static get(homebridge: API, device: IDevice): Device | undefined {
        const id = homebridge.hap.uuid.generate(device.id);

        return devices.get(id);
    }

    /**
     * Removes an internally cached device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the common device object.
     */
    public static remove(homebridge: API, device: IDevice): void {
        const id = homebridge.hap.uuid.generate(device.id);
        const accessory = accessories.get(id);

        if (accessory != null) {
            homebridge.unregisterPlatformAccessories(plugin, platform, [accessory]);
        }
    }
}

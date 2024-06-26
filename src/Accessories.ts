import * as Baf from "@mkellsy/baf-client";
import * as Leap from "@mkellsy/leap-client";

import { API, Logging } from "homebridge";
import { DeviceType, Device as IDevice } from "@mkellsy/hap-device";

import { accessories, devices, platform, plugin } from "./Platform";

import { Fan } from "./Devices/Fan";
import { Humidity } from "./Devices/Humidity";
import { Keypad } from "./Devices/Keypad";
import { Occupancy } from "./Devices/Occupancy";
import { Strip } from "./Devices/Strip";
import { Temperature } from "./Devices/Temperature";
import { Timeclock } from "./Devices/Timeclock";

import { Device } from "./Interfaces/Device";
import { System, parseSystem } from "./Interfaces/System";

export abstract class Accessories {
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

    public static get(homebridge: API, device: IDevice): Device | undefined {
        const id = homebridge.hap.uuid.generate(device.id);

        return devices.get(id);
    }

    public static remove(homebridge: API, device: IDevice): void {
        const id = homebridge.hap.uuid.generate(device.id);
        const accessory = accessories.get(id);

        if (accessory != null) {
            homebridge.unregisterPlatformAccessories(plugin, platform, [accessory]);
        }
    }
}

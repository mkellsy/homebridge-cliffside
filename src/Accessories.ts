import { API, Logging, PlatformConfig } from "homebridge";
import { DeviceType, Device as IDevice, Keypad as IKeypad } from "@mkellsy/hap-device";

import { accessories, devices, platform, plugin } from "./Platform";

import { Contact } from "./Devices/Contact";
import { Dimmer } from "./Devices/Dimmer";
import { Fan } from "./Devices/Fan";
import { Humidity } from "./Devices/Humidity";
import { Keypad } from "./Devices/Keypad";
import { Occupancy } from "./Devices/Occupancy";
import { Shade } from "./Devices/Shade";
import { Strip } from "./Devices/Strip";
import { Switch } from "./Devices/Switch";
import { Temperature } from "./Devices/Temperature";

import { Device } from "./Interfaces/Device";
import { System, parseSystem } from "./Interfaces/System";

export abstract class Accessories {
    public static create(homebridge: API, device: IDevice, config: PlatformConfig, log: Logging): Device | undefined {
        const system: System = parseSystem(device);

        if (config[system] == null) {
            return undefined;
        }

        switch (device.type) {
            case DeviceType.Contact:
                if (config[system].cco === false) {
                    return undefined;
                }

                return new Contact(system, homebridge, device, config, log);

            case DeviceType.Dimmer:
                if (config[system].dimmers === false) {
                    return undefined;
                }

                return new Dimmer(system, homebridge, device, config, log);

            case DeviceType.Fan:
                if (config[system].fans === false) {
                    return undefined;
                }

                return new Fan(system, homebridge, device, config, log);

            case DeviceType.Humidity:
                if (config[system].sensors === false) {
                    return undefined;
                }

                return new Humidity(system, homebridge, device, config, log);

            case DeviceType.Keypad:
                if (config[system].keypads === false) {
                    return undefined;
                }

                return new Keypad(system, homebridge, device as IKeypad, config, log);

            case DeviceType.Occupancy:
                if (config[system].sensors === false) {
                    return undefined;
                }

                return new Occupancy(system, homebridge, device, config, log);

            case DeviceType.Remote:
                if (config[system].remotes === false) {
                    return undefined;
                }

                return new Keypad(system, homebridge, device as IKeypad, config, log);

            case DeviceType.Shade:
                if (config[system].shades === false) {
                    return undefined;
                }

                return new Shade(system, homebridge, device, config, log);

            case DeviceType.Strip:
                if (config[system].strips === false) {
                    return undefined;
                }

                return new Strip(system, homebridge, device, config, log);

            case DeviceType.Switch:
                if (config[system].switches === false) {
                    return undefined;
                }

                return new Switch(system, homebridge, device, config, log);

            case DeviceType.Temperature:
                if (config[system].sensors === false) {
                    return undefined;
                }

                return new Temperature(system, homebridge, device, config, log);
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

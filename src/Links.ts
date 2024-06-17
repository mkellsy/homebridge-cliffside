import * as Leap from "@mkellsy/leap-client";
import * as Interfaces from "@mkellsy/hap-device";

import fs from "fs";
import os from "os";
import path from "path";

import { Logging } from "homebridge";

import { Dimmer } from "./Devices/Dimmer";
import { Fan } from "./Devices/Fan";
import { LinkType, parseLinkType } from "./Interfaces/LinkType";

/**
 * Defines how devices are linked to each other.
 */
export class Links {
    private readonly log: Logging;

    private readonly links: Map<string, string> = new Map();
    private readonly filename = path.join(os.homedir(), ".leap/links.json");

    private readonly devices: Map<string, Interfaces.Device> = new Map();

    constructor(log: Logging) {
        this.log = log;

        try {
            const contents = fs.readFileSync(this.filename).toString();
            const values: string[][] = JSON.parse(contents);

            for (const value of values) {
                this.links.set(value[0], value[1]);
            }
        } catch (error) {
            /* no-op */
        }
    }

    /**
     * Adds an available device. All devices are needed because the links are
     * by device id.
     *
     * @param device The discovered device to add.
     */
    public set(device: Interfaces.Device): void {
        this.devices.set(device.id, device);
    }

    /**
     * Update a device's linked devices.
     *
     * @param device The device that just updated.
     * @param status The status of the device.
     */
    public update(device: Interfaces.Device, status: Interfaces.DeviceState): void {
        const linked = this.devices.get(this.links.get(device.id) || "");

        if (linked == null) {
            return;
        }

        this.syncDevices(device, linked, status).catch((error: Error) => this.log.error(error.message));
    }

    /*
     * Executes the desired action on the linked device
     */
    private syncDevices(
        device: Interfaces.Device,
        linked: Interfaces.Device,
        status: Interfaces.DeviceState,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let level: number;
            let speed: number;

            let opposing: Interfaces.Device | undefined;

            switch (parseLinkType(device, linked)) {
                case LinkType.DimmerToDimmer:
                    level = (status as Leap.DimmerState).level;
                    opposing = this.getOpposing(linked);

                    if (opposing != null) {
                        Dimmer.updateLevel(opposing, 0)
                            .then(() => {
                                Dimmer.updateLevel(linked, level)
                                    .then(() => resolve())
                                    .catch((error: Error) => reject(error));
                            })
                            .catch((error: Error) => reject(error));
                    } else {
                        Dimmer.updateLevel(linked, level)
                            .then(() => resolve())
                            .catch((error: Error) => reject(error));
                    }

                    break;

                case LinkType.DimmerToFan:
                    speed = Fan.convertLevel((status as Leap.DimmerState).level, linked.status);
                    level = Dimmer.convertSpeed(speed);

                    Fan.updateSpeed(device, linked, speed)
                        .then(() => resolve())
                        .catch((error: Error) => error);
                    break;

                default:
                    resolve();
                    break;
            }
        });
    }

    /*
     * BAF has two opposing lights, where one turns off when the other turns on.
     */
    private getOpposing(device: Interfaces.Device): Interfaces.Device | undefined {
        if (device.id.includes("DOWNLIGHT")) {
            return this.getControl(device.id.replace("DOWNLIGHT", "UPLIGHT"));
        }

        if (device.id.includes("UPLIGHT")) {
            return this.getControl(device.id.replace("UPLIGHT", "DOWNLIGHT"));
        }

        return undefined;
    }

    /*
     * Fetches the control device from a linked device.
     */
    private getControl(linked: string): Interfaces.Device | undefined {
        const links = Array.from(this.links.entries());
        const filtered = links.find(([, value]) => value === linked);

        return filtered != null ? this.devices.get(filtered[0]) : undefined;
    }
}

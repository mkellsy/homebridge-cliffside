import * as Leap from "@mkellsy/leap-client";
import * as Interfaces from "@mkellsy/hap-device";

import fs from "fs";
import os from "os";
import path from "path";

import { Logging } from "homebridge";

import { Dimmer } from "./Dimmer";
import { Fan } from "./Fan";
import { LinkType, parseLinkType } from "./LinkType";

/**
 * Defines how devices are linked to each other.
 * @private
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
    private async syncDevices(
        device: Interfaces.Device,
        linked: Interfaces.Device,
        status: Interfaces.DeviceState,
    ): Promise<void> {
        let level: number;
        let speed: number;

        let opposing: Interfaces.Device | undefined;

        switch (parseLinkType(device, linked)) {
            case LinkType.DimmerToDimmer:
                level = (status as Leap.DimmerState).level;
                opposing = this.getOpposing(linked);

                this.log.debug(`Linked dimmer ${linked.id}`);

                if (opposing != null && opposing.status.state === "On" && level > 0) {
                    this.log.debug(`Oposing dimmer ${opposing.id}`);

                    await Dimmer.updateLevel(opposing, 0);

                    setTimeout(async () => {
                        await Dimmer.updateLevel(linked, level);
                    }, 250);
                } else {
                    await Dimmer.updateLevel(linked, level);
                }

                break;

            case LinkType.DimmerToFan:
                speed = Fan.convertLevel((status as Leap.DimmerState).level, linked.status);
                level = Dimmer.convertSpeed(speed);

                this.log.debug(`Linked fan ${linked.id}`);

                await Fan.updateSpeed(device, linked, speed);
                break;
        }
    }

    /*
     * BAF has two opposing lights, where one turns off when the other turns on.
     */
    private getOpposing(device: Interfaces.Device): Interfaces.Device | undefined {
        if (device.id.indexOf("DOWNLIGHT") >= 0) {
            return this.getControl(device.id.replace("DOWNLIGHT", "UPLIGHT"));
        }

        if (device.id.indexOf("UPLIGHT") >= 0) {
            return this.getControl(device.id.replace("UPLIGHT", "DOWNLIGHT"));
        }

        return undefined;
    }

    /*
     * Fetches the control device from a linked device.
     */
    private getControl(id: string): Interfaces.Device | undefined {
        for (const [key, value] of this.links.entries()) {
            if (value === id) {
                return this.devices.get(key);
            }
        }

        return undefined;
    }
}

import * as Baf from "@mkellsy/baf-client";
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
    private readonly locks: Set<string> = new Set();

    constructor(log: Logging) {
        this.log = log;

        try {
            const contents = fs.readFileSync(this.filename).toString();
            const values: string[][] = JSON.parse(contents);

            for (const value of values) {
                this.links.set(value[0], value[1]);
                this.links.set(value[1], value[0]);
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

        if (linked == null || this.locks.has(linked.id)) {
            return;
        }

        this.syncDevices(device, linked, status);
    }

    /*
     * Locks a device from the next update.
     */
    private lockDevice(device: Interfaces.Device): void {
        this.locks.add(device.id);

        setTimeout(() => this.locks.delete(device.id), 1_000);
    }

    /*
     * Executes the desired action on the linked device
     */
    private syncDevices(device: Interfaces.Device, linked: Interfaces.Device, status: Interfaces.DeviceState): void {
        let level: number;
        let speed: number;

        switch (parseLinkType(device, linked)) {
            case LinkType.Equal:
                this.lockDevice(linked);

                linked.set({ ...linked.status, ...status }).catch((error) => this.log.error(error));
                return;

            case LinkType.DimmerToFan:
                this.lockDevice(linked);

                speed = Fan.convertLevel((status as Leap.DimmerState).level, linked.status);
                level = Dimmer.convertSpeed(speed);

                Fan.updateSpeed(linked, speed).catch((error) => this.log.error(error));
                Dimmer.updateLevel(device, level).catch((error) => this.log.error(error));
                return;

            case LinkType.FanToDimmer:
                this.lockDevice(linked);

                level = Dimmer.convertSpeed((status as Baf.FanState).speed);

                Dimmer.updateLevel(linked, level).catch((error) => this.log.error(error));
                return;
        }
    }
}

import * as Leap from "@mkellsy/leap-client";
import * as Interfaces from "@mkellsy/hap-device";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

/**
 * Creates a dimmer device.
 */
export class Dimmer extends Common<Leap.Dimmer> implements Device {
    private service: Service;

    /**
     * Creates a dimmer device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the discovered device.
     * @param log A refrence to the Homebridge logger.
     */
    constructor(homebridge: API, device: Leap.Dimmer, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.Lightbulb) ||
            this.accessory.addService(this.homebridge.hap.Service.Lightbulb, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.On)
            .onGet(this.onGetState)
            .onSet(this.onSetState);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
            .onGet(this.onGetBrightness)
            .onSet(this.onSetBrightness);
    }

    /**
     * Converts a fan speed level to a dimmer level.
     *
     * @param level The fan speed.
     *
     * @returns The brightness level as a number.
     */
    public static convertSpeed(speed: number): number {
        return Math.round((speed / 7) * 100);
    }

    /**
     * Updates the brightness level of a dimmer.
     *
     * @param device The device to update.
     * @param level The brightness level.
     * @param toggled (Optional) The device that is oppiside the dimmer. For
     *                BAF uplight and downlights can only be controled one at a
     *                time, and only one can be on. While the app can sync the
     *                two lights, only one can be controled.
     */
    public static updateLevel(device: Interfaces.Device, level: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const state = level > 0 ? "On" : "Off";

            (device as Leap.Dimmer)
                .set({ ...device.status, state, level })
                .then(() => resolve())
                .catch((error: Error) => reject(error));
        });
    }

    /**
     * Updates Homebridge accessory when an update comes from the device.
     *
     * @param state The current dimmer state.
     */
    public onUpdate(state: Leap.DimmerState): void {
        this.log.debug(`Dimmer: ${this.device.name} State: ${state.state}`);
        this.log.debug(`Dimmer: ${this.device.name} Brightness: ${state.level}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.state === "On");
        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.Brightness, state.level);
    }

    /**
     * Fetches the current state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Dimmer Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "On";
    };

    /**
     * Updates the device when a change comes in from Homebridge.
     */
    private onSetState = (value: CharacteristicValue): void => {
        const state = value ? "On" : "Off";
        const level = value ? 100 : 0;

        if (this.device.status.state !== state || this.device.status.level !== level) {
            this.log.debug(`Dimmer Set State: ${this.device.name} ${state}`);
            this.log.debug(`Dimmer Set Brightness: ${this.device.name} ${level}`);

            this.device.set({ state, level }).catch((error: Error) => this.log.error(error.message));
        }
    };

    /**
     * Fetches the current brightness when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetBrightness = (): CharacteristicValue => {
        this.log.debug(`Dimmer Get Brightness: ${this.device.name} ${this.device.status.level}`);

        return this.device.status.level;
    };

    /**
     * Updates the device when a change comes in from Homebridge.
     */
    private onSetBrightness = (value: CharacteristicValue): void => {
        const level = (value || 0) as number;
        const state = level > 0 ? "On" : "Off";

        if (this.device.status.state !== state || this.device.status.level !== level) {
            this.log.debug(`Dimmer Set State: ${this.device.name} ${state}`);
            this.log.debug(`Dimmer Set Brightness: ${this.device.name} ${level}`);

            this.device.set({ state, level }).catch((error: Error) => this.log.error(error.message));
        }
    };
}

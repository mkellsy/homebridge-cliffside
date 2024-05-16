import { API, CharacteristicValue, Logging, PlatformConfig, Service } from "homebridge";
import { DeviceState, Occupancy as IOccupancy } from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { System } from "../Interfaces/System";

export class Occupancy extends Common implements Device {
    private service: Service;

    constructor(system: System, homebridge: API, device: IOccupancy, config: PlatformConfig, log: Logging) {
        super(system, homebridge, device, config, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.OccupancySensor) ||
            this.accessory.addService(this.homebridge.hap.Service.OccupancySensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.OccupancyDetected).onGet(this.onGetState);
    }

    public onUpdate(state: DeviceState): void {
        this.log.debug(`Occupancy: ${this.device.name} State: ${state.state === "Occupied" ? "Detected" : "Not Detected"}`);

        this.service.updateCharacteristic(
            this.homebridge.hap.Characteristic.OccupancyDetected,
            state.state === "Occupied"
        );
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Occupancy Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "Occupied";
    };
}

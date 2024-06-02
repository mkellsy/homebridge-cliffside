import { API, CharacteristicValue, Logging, PlatformConfig, Service } from "homebridge";
import { DeviceState, Humidity as IHumidity } from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { System } from "../Interfaces/System";

export class Humidity extends Common implements Device {
    private service: Service;

    constructor(system: System, homebridge: API, device: IHumidity, config: PlatformConfig, log: Logging) {
        super(system, homebridge, device, config, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.HumiditySensor) ||
            this.accessory.addService(this.homebridge.hap.Service.HumiditySensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity)
            .onGet(this.onGetState);
    }

    public onUpdate(state: DeviceState): void {
        this.log.debug(`Humidity: ${this.device.name} State: ${state.humidity || 0}`);

        this.service.updateCharacteristic(
            this.homebridge.hap.Characteristic.CurrentRelativeHumidity,
            state.humidity || 0,
        );
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Humidity Get State: ${this.device.name} ${this.device.status.humidity || 0}`);

        return this.device.status.humidity || 0;
    };
}

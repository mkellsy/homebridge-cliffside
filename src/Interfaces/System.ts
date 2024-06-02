import { Device } from "@mkellsy/hap-device";

export enum System {
    Unknown = "Unknown",
    leap = "leap",
    baf = "baf",
}

export function parseSystem(device: Device): System {
    switch (device.manufacturer) {
        case "Lutron Electronics Co., Inc":
            return System.leap;

        case "Delta T, LLC":
            return System.baf;

        default:
            return System.Unknown;
    }
}

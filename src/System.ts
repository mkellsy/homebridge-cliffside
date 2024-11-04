import { Device } from "@mkellsy/hap-device";

/**
 * Defines the available systems.
 * @private
 */
export enum System {
    Unknown = "Unknown",
    leap = "leap",
    baf = "baf",
}

/**
 * Parses a manafacturer to a system enum value;
 *
 * @param device The device to parse.
 *
 * @returns A system enum.
 * @private
 */
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

import fs from "fs";
import os from "os";
import path from "path";

import { LinkType } from "./Interfaces/LinkType";
import { Device, DeviceType } from "@mkellsy/hap-device";

const links = new Map<string, string>();
const filename = path.join(os.homedir(), ".leap/links.json");

if (fs.existsSync(filename)) {
    try {
        const contents = fs.readFileSync(filename).toString();
        const values: string[][] = JSON.parse(contents);

        for (const value of values) {
            links.set(value[0], value[1]);
            links.set(value[1], value[0]);
        }
    } catch (error) {
        /* no-op */
    }
}

/**
 * Determines a link type from a source and destination device.
 *
 * @param source A reference to the device that triggered the update.
 * @param destination A referrence to the device to sync with the source.
 *
 * @returns A link type.
 */
export function getLinkType(source?: Device, destination?: Device): LinkType {
    if (source == null || destination == null) {
        return LinkType.Incompatible;
    }

    switch (source.type) {
        case DeviceType.Dimmer:
            switch (destination.type) {
                case DeviceType.Dimmer:
                    return LinkType.Equal;

                case DeviceType.Fan:
                    return LinkType.DimmerToFan;

                default:
                    return LinkType.Incompatible;
            }

        case DeviceType.Fan:
            switch (destination.type) {
                case DeviceType.Dimmer:
                    return LinkType.FanToDimmer;

                case DeviceType.Fan:
                    return LinkType.Equal;

                default:
                    return LinkType.Incompatible;
            }

        default:
            return LinkType.Incompatible;
    }
}

export { links };

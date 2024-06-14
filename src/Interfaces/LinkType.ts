import { Device, DeviceType } from "@mkellsy/hap-device";

/**
 * Defines the available link types.
 */
export enum LinkType {
    /**
     * Both devices are equal and can be synced directly.
     */
    Equal,

    /**
     * The source is a dimmer and brightness needs to be translated to a fan
     * speed value.
     */
    DimmerToFan,

    /**
     * The source is a fan and the fan speed needs to be translated to a
     * brightness value.
     */
    FanToDimmer,

    /**
     * The device types are not compatible.
     */
    Incompatible,
}

/**
 * Converts a device link to a link type.
 *
 * @param source The device that is being updated.
 * @param destination The linked device to be updated.
 *
 * @returns Returns the link type.
 */
export function parseLinkType(source: Device, destination: Device): LinkType {
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

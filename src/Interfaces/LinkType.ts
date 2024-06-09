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

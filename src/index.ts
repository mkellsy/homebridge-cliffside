/**
 * This is a highly customized plugin for a single location.
 *
 * @packageDocumentation
 */

import { API } from "homebridge";
import { Platform, platform, plugin } from "./Platform";

/**
 * Defines an entrypoint for Homebridge and registers a Platform object.
 *
 * @param homebridge - A reference to the Homebridge API.
 * @public
 */
export = (homebridge: API) => {
    homebridge.registerPlatform(plugin, platform, Platform);
};

# Homebridge Cliffside

This is a highly customized plugin for a single location. This requires [Homebridge](https://homebridge.io/) to run.

## CLI

**Pairing a processor**

```
cliffside pair
```

This will automatically discover processors. You will need to press the pairing button on your processor.

> Systems that have more than one processor, such as RA3, you will only need to pair the first processor. Devices programed for other bridges are vended from all processors.

After you have a processor or bridge paired, you can start Homebridge.

**Listing all controllable devices**

```
cliffside devices
```

This will print all device names and IDs that are controllable in lambdas.

**List all remotes and keypads**

```
cliffside keypads
```

This will print all keypad device names and IDs.

**List all buttons**

```
cliffside buttons
```

This will print all button names and IDs. These are the IDs that will be used in lambdas, for the `button` field.

## Configuration

This plugin doesn't require any configuration other than the platform to work. The default is to expose remotes, keypads, and sensors for LEAP connections, and fans, and lights for Big Ass Fan connections.

```json
{
    "platforms": [
        {
            "name": "Cliffside",
            "platform": "Cliffside"
        }
    ]
}
```

You can turn on other devices too. These devices are not turned on because they are already exposed by Lutron's HomeKit integration.

```json
{
    "platforms": [
        {
            "name": "Cliffside",
            "platform": "Cliffside",
            "leap": {
                "cco": false,
                "dimmers": false,
                "keypads": true,
                "sensors": true,
                "remotes": true,
                "shades": false,
                "strips": false,
                "switches": false
            },
            "baf": {
                "dimmers": true,
                "fans": true,
                "sensors": true,
                "switches": true
            }
        }
    ]
}
```

## Lambdas

This plugin allows writing lambda functions that can be assigned to buttons. That follow this pattern.

```
interface Action {
    button: string;

    action(state: Action, devices: Map<string, IDevice>): void;
}
```

> Actions are "Press", "DoublePress", "LongPress", and "Release".

Lambdas need to be stored in a folder at the same level as `.homebridge`. The folder is `~/house`.

[Example Lambdas](https://github.com/mkellsy/cliffside-lambdas/tree/main/src)

## Support

I offer not support for this plugin, it is published only for personal use.

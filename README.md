# Homebridge Cliffside
This is a highly customized plugin for a single location.

## CLI
Pairing a processor

```
cliffside pair
```

This will automatically discover processors. You will need to press the pairing button on your processor.

> Systems that have more than one processor, such as RA3, you will only need to pair the first processor. Devices programed for other bridges are vended from all processors.

After you have a processor or bridge paired, you can start Homebridge.

## Configuration
This plugin doesn't require any configuration other than the platform to work. The default is to expose remotes, keypads and sensors.

```json
{
    "platforms": [
        {
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
            "platform": "Cliffside",
            "cco": false,
            "dimmers": false,
            "fans": true,
            "keypads": true,
            "sensors": true,
            "remotes": true,
            "shades": false,
            "strips": false,
            "switches": false
        }
    ]
}
```

## Support
I offer not support for this plugin, it is published only for personal use.

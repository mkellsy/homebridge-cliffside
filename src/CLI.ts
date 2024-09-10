import * as Baf from "@mkellsy/baf-client";
import * as Leap from "@mkellsy/leap-client";

import Colors from "colors";

import { Device, DeviceType, Keypad } from "@mkellsy/hap-device";
import { Logger } from "./Logger";

import { program } from "commander";

const FAN_COUNT = 4;

const log = Logger.log;

program.option("-d, --debug", "enable debug logging");

program.command("pair").action(() => {
    Logger.configure(program);

    console.log(Colors.green("Press the pairing button on the main processor or smart bridge"));

    Leap.pair()
        .then(() => log.info("Processor paired"))
        .catch((error: Error) => log.error(Colors.red(error.message)))
        .finally(() => process.exit(0));
});

program
    .command("read")
    .argument("<string>", "url to send to the processor")
    .action((url) => {
        Logger.configure(program);

        const location = Leap.connect();

        location.on("Available", () => {
            const id = location.processors[0];
            const processor = location.processor(id);

            if (processor == null) {
                return process.exit();
            }

            processor
                .read(url)
                .then((response) => log.info(Logger.inspect(response)))
                .finally(() => process.exit());
        });
    });

program.command("devices").action(() => {
    Logger.configure(program);

    const devices: Device[] = [];
    let fans: number = 0;

    Promise.all([
        new Promise<void>((resolve) => {
            Leap.connect().on("Available", (items) => {
                devices.push(...items);
                resolve();
            });
        }),
        new Promise<void>((resolve) => {
            Baf.connect().on("Available", (items) => {
                fans += 1;

                if (fans === FAN_COUNT) {
                    devices.push(...items);
                    resolve();
                }
            });
        }),
    ]).then(() => {
        const types = [
            DeviceType.Contact,
            DeviceType.Dimmer,
            DeviceType.Fan,
            DeviceType.Keypad,
            DeviceType.Shade,
            DeviceType.Strip,
            DeviceType.Switch,
            DeviceType.Timeclock,
        ];

        const controllable = devices
            .filter((device) => types.indexOf(device.type) >= 0)
            .sort((a, b) => (`${a.area.Name} ${a.name}` < `${b.area.Name} ${b.name}` ? -1 : 1));

        for (const device of controllable) {
            log.info(
                `${device.name.startsWith(device.area.Name) ? device.name : `${device.area.Name} ${device.name}`} ${Colors.cyan.dim(device.id)}`,
            );
        }

        process.exit();
    });
});

program.command("keypads").action(() => {
    Logger.configure(program);

    const types = [DeviceType.Keypad, DeviceType.Remote];

    Leap.connect().on("Available", (devices) => {
        const keypads = devices
            .filter((device) => types.indexOf(device.type) >= 0)
            .sort((a, b) => (`${a.area.Name} ${a.name}` < `${b.area.Name} ${b.name}` ? -1 : 1));

        for (const keypad of keypads) {
            log.info(`${keypad.name} ${Colors.cyan.dim(keypad.id)}`);
        }

        process.exit();
    });
});

program.command("buttons").action(() => {
    Logger.configure(program);

    const types = [DeviceType.Keypad, DeviceType.Remote];

    Leap.connect().on("Available", (devices) => {
        const keypads = devices
            .filter((device) => types.indexOf(device.type) >= 0)
            .sort((a, b) => (`${a.area.Name} ${a.name}` < `${b.area.Name} ${b.name}` ? -1 : 1))
            .map((device) => device as Keypad);

        for (const keypad of keypads) {
            for (const button of keypad.buttons) {
                log.info(`${keypad.name} ${Colors.green(button.name)} ${Colors.cyan.dim(button.id)}`);
            }
        }

        process.exit();
    });
});

program.command("timeclocks").action(() => {
    Logger.configure(program);

    Leap.connect().on("Available", (devices) => {
        const timeclocks = devices
            .filter((device) => device.type === DeviceType.Timeclock)
            .sort((a, b) => (`${a.area.Name} ${a.name}` < `${b.area.Name} ${b.name}` ? -1 : 1))
            .map((device) => device as Keypad);

        for (const timeclock of timeclocks) {
            log.info(`${timeclock.name} ${Colors.cyan.dim(timeclock.id)}`);
        }

        process.exit();
    });
});

export = function main(args?: string[] | undefined): void {
    program.parse(args || process.argv);
};

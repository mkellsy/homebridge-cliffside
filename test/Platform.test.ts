import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";
import { Platform } from "../src/Platform";

chai.use(sinonChai);
registerNode();

describe("Platform", () => {
    let homebridgeStub: any;
    let configStub: any;
    let deviceStub: any;
    let buttonStub: any;
    let leapStub: any;
    let bafStub: any;
    let hapStub: any;
    let logStub: any;

    let characteristicStub: any;
    let accessoryStub: any;

    let platform: Platform;
    let platformType: typeof Platform;

    const emit = (stub: any, event: string, ...payload: any[]) => {
        for (const callback of stub.callbacks[event] || []) {
            callback(...payload);
        }
    };

    before(() => {
        platformType = proxy(() => require("../src/Platform").Platform, {
            "@mkellsy/leap-client": {
                connect() {
                    return {
                        on(event: string, callback: Function) {
                            if (leapStub.callbacks[event] == null) {
                                leapStub.callbacks[event] = [];
                            }

                            leapStub.callbacks[event].push(callback);

                            return this;
                        },
                    };
                },
            },
            "@mkellsy/baf-client": {
                connect() {
                    return {
                        on(event: string, callback: Function) {
                            if (bafStub.callbacks[event] == null) {
                                bafStub.callbacks[event] = [];
                            }

                            bafStub.callbacks[event].push(callback);

                            return this;
                        },
                    };
                },
            },
        });
    });

    beforeEach(() => {
        leapStub = { callbacks: {} };
        bafStub = { callbacks: {} };

        logStub = {
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
            debug: sinon.stub(),
        };

        hapStub = {
            uuid: {
                generate: sinon.stub().returns("UUID_PLATFORM"),
            },
            Service: {
                AccessoryInformation: "AccessoryInformation",
            },
            Characteristic: {
                Model: "Model",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
                ServiceLabelNamespace: {
                    ARABIC_NUMERALS: 1,
                },
                ProgrammableSwitchEvent: {
                    SINGLE_PRESS: 0,
                    DOUBLE_PRESS: 1,
                    LONG_PRESS: 2,
                },
            },
        };

        characteristicStub = {
            callbacks: {},
            setProps: sinon.stub(),
            updateValue: sinon.stub(),

            onGet(callback: Function) {
                this.callbacks["Get"] = [callback];

                return this;
            },

            onSet(callback: Function) {
                this.callbacks["Set"] = [callback];

                return this;
            },
        };

        accessoryStub = {
            setCharacteristic: sinon.stub().returns(accessoryStub),
            getCharacteristic: sinon.stub().returns(characteristicStub),
            updateCharacteristic: sinon.stub(),
            addLinkedService: sinon.stub(),
        };

        homebridgeStub = {
            callbacks: {},

            hap: hapStub,
            registerPlatformAccessories: sinon.stub(),
            unregisterPlatformAccessories: sinon.stub(),

            platformAccessory: class {
                getService: any = () => accessoryStub;
                getServiceById: any = () => accessoryStub;
            },

            on(event: string, callback: Function) {
                if (this.callbacks[event] == null) {
                    this.callbacks[event] = [];
                }

                this.callbacks[event].push(callback);

                return this;
            },
        };

        configStub = {
            name: "Lutron",
            platform: "Lutron",
            cco: true,
            dimmers: true,
            fans: true,
            keypads: true,
            sensors: true,
            remotes: true,
            shades: true,
            strips: true,
            switches: true,
            timeclocks: true,
        };

        deviceStub = {
            id: "ID",
            type: DeviceType.Strip,
            update: sinon.stub(),
            set: sinon.stub(),
        };

        buttonStub = {
            id: "ID",
            index: 1,
            name: "NAME",
        };

        platform = new platformType(logStub, configStub, homebridgeStub);
    });

    it("should define the finish launching event", () => {
        expect(homebridgeStub.callbacks["didFinishLaunching"]).to.not.be.undefined;
    });

    it("should bind events after launching", () => {
        emit(homebridgeStub, "didFinishLaunching");

        expect(leapStub.callbacks["Available"]).to.not.be.undefined;
        expect(leapStub.callbacks["Update"]).to.not.be.undefined;

        expect(bafStub.callbacks["Available"]).to.not.be.undefined;
        expect(bafStub.callbacks["Update"]).to.not.be.undefined;
    });

    describe("onAvailable()", () => {
        beforeEach(() => {
            emit(homebridgeStub, "didFinishLaunching");
        });

        it("should create a device and register to homebridge", () => {
            emit(leapStub, "Available", [deviceStub]);

            expect(homebridgeStub.registerPlatformAccessories).to.be.calledWith(
                "@mkellsy/homebridge-cliffside",
                "Cliffside",
                sinon.match.any,
            );
        });

        it("should unregister an undefined device from homebridge", () => {
            deviceStub.type = DeviceType.Unknown;

            emit(leapStub, "Available", [deviceStub]);

            expect(homebridgeStub.unregisterPlatformAccessories).to.be.calledWith(
                "@mkellsy/homebridge-cliffside",
                "Cliffside",
                sinon.match.any,
            );
        });

        it("should not register an undefined device", () => {
            deviceStub.type = DeviceType.Unknown;

            emit(leapStub, "Available", [deviceStub]);
            expect(homebridgeStub.registerPlatformAccessories).to.not.be.called;
        });

        it("should not register a cached device", () => {
            platform.configureAccessory(new homebridgeStub.platformAccessory());

            emit(leapStub, "Available", [deviceStub]);

            expect(homebridgeStub.registerPlatformAccessories).to.not.be.called;
            expect(homebridgeStub.unregisterPlatformAccessories).to.not.be.called;
        });
    });

    describe("onAction()", () => {
        beforeEach(() => {
            emit(homebridgeStub, "didFinishLaunching");

            deviceStub = {
                id: "ID",
                type: DeviceType.Remote,
                update: sinon.stub(),
                set: sinon.stub(),
                buttons: [buttonStub],
            };
        });

        it("should call update value characteristic when an action event is recieved", () => {
            emit(leapStub, "Available", [deviceStub]);
            emit(leapStub, "Action", deviceStub, buttonStub, "Press");

            expect(characteristicStub.updateValue).to.be.called;
        });

        it("should not call update value characteristic for unregistered devices", () => {
            hapStub.uuid.generate.returns("UUID_PLATFORM_2");

            emit(leapStub, "Action", deviceStub, buttonStub, "Press");
            expect(characteristicStub.updateValue).to.not.be.called;
        });
    });

    describe("onUpdate()", () => {
        beforeEach(() => {
            emit(homebridgeStub, "didFinishLaunching");
        });

        it("should call update characteristic when an update event is recieved", () => {
            emit(leapStub, "Available", [deviceStub]);
            emit(leapStub, "Update", deviceStub, { state: "Off", level: 0 });

            expect(accessoryStub.updateCharacteristic).to.be.called;
        });

        it("should not call update characteristic for unregistered devices", () => {
            hapStub.uuid.generate.returns("UUID_PLATFORM_2");

            emit(leapStub, "Update", deviceStub, { state: "Off", level: 0 });
            expect(accessoryStub.updateCharacteristic).to.not.be.called;
        });
    });
});
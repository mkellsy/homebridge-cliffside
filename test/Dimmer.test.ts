import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";
import { Dimmer } from "../src/Dimmer";

chai.use(sinonChai);

describe("Dimmer", () => {
    let homebridgeStub: any;
    let serviceStub: any;
    let deviceStub: any;
    let hapStub: any;
    let logStub: any;

    let stateStub: any;
    let levelStub: any;
    let accessoryStub: any;

    let dimmer: Dimmer;

    beforeEach(() => {
        logStub = {
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
            debug: sinon.stub(),
        };

        hapStub = {
            uuid: {
                generate: sinon.stub().returns("UUID_ACCESSORIES"),
            },
            Service: {
                AccessoryInformation: "AccessoryInformation",
                Lightbulb: "Lightbulb",
            },
            Characteristic: {
                On: "On",
                Model: "Model",
                Brightness: "Brightness",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
            },
        };

        stateStub = {
            callbacks: {},

            onGet(callback: Function) {
                this.callbacks["Get"] = callback;

                return this;
            },

            onSet(callback: Function) {
                this.callbacks["Set"] = callback;

                return this;
            },
        };

        levelStub = {
            callbacks: {},

            onGet(callback: Function) {
                this.callbacks["Get"] = callback;

                return this;
            },

            onSet(callback: Function) {
                this.callbacks["Set"] = callback;

                return this;
            },
        };

        accessoryStub = {
            setCharacteristic: sinon.stub(),
            getCharacteristic: sinon.stub(),
            updateCharacteristic: sinon.stub(),
        };

        accessoryStub.setCharacteristic.returns(accessoryStub);
        accessoryStub.getCharacteristic.withArgs("On").returns(stateStub);
        accessoryStub.getCharacteristic.withArgs("Brightness").returns(levelStub);
        serviceStub = sinon.stub();

        homebridgeStub = {
            callbacks: {},

            hap: hapStub,
            on: sinon.stub(),
            registerPlatformAccessories: sinon.stub(),
            unregisterPlatformAccessories: sinon.stub(),

            platformAccessory: class {
                getService: any = serviceStub;
                addService: any = sinon.stub().returns(accessoryStub);
            },
        };

        deviceStub = {
            id: "ID_DIMMER",
            name: "NAME",
            type: DeviceType.Dimmer,
            status: { state: "On", level: 50 },
            update: sinon.stub(),
            set: sinon.stub(),
            capabilities: {},
        };
    });

    it("should bind listeners when device is created", () => {
        serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);

        dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;

        expect(levelStub.callbacks["Get"]).to.not.be.undefined;
        expect(levelStub.callbacks["Set"]).to.not.be.undefined;
    });

    it("should bind listeners when device is created from cache", () => {
        serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        serviceStub.withArgs("LightBulb").returns(accessoryStub);

        dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;

        expect(levelStub.callbacks["Get"]).to.not.be.undefined;
        expect(levelStub.callbacks["Set"]).to.not.be.undefined;
    });

    describe("convertSpeed()", () => {
        const TEST_CASES = [
            { value: 0, expected: 0 },
            { value: 1, expected: 14 },
            { value: 2, expected: 29 },
            { value: 3, expected: 43 },
            { value: 4, expected: 57 },
            { value: 5, expected: 71 },
            { value: 6, expected: 86 },
            { value: 7, expected: 100 },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should convert ${TEST_CASE.value} to ${TEST_CASE.expected}`, () => {
                expect(Dimmer.convertSpeed(TEST_CASE.value)).to.equal(TEST_CASE.expected);
            });
        });
    });

    describe("updateLevel()", () => {
        let setStub: any;

        const TEST_CASES = [
            { value: 0, state: "Off" },
            { value: 14, state: "On" },
            { value: 28, state: "On" },
            { value: 42, state: "On" },
            { value: 56, state: "On" },
            { value: 70, state: "On" },
            { value: 84, state: "On" },
            { value: 98, state: "On" },
        ];

        beforeEach(() => {
            setStub = sinon.promise();
            deviceStub.set.returns(setStub);
        });

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should set dimmer to ${TEST_CASE.value}`, (done) => {
                Dimmer.updateLevel(deviceStub, TEST_CASE.value)
                    .then(() => {
                        expect(deviceStub.set).to.be.calledWith({ state: TEST_CASE.state, level: TEST_CASE.value });

                        done();
                    })
                    .catch((error) => console.log(error));

                setStub.resolve();
            });

            it("should reject if the set fails", (done) => {
                Dimmer.updateLevel(deviceStub, TEST_CASE.value).catch((error) => {
                    expect(error).to.equal("TEST_ERROR");

                    done();
                });

                setStub.reject("TEST_ERROR");
            });
        });
    });

    describe("onUpdate()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("LightBulb").returns(accessoryStub);

            dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);
        });

        it("should update the state to on", () => {
            dimmer.onUpdate({ state: "On", level: 100 });

            expect(accessoryStub.updateCharacteristic).to.be.calledWith("On", true);
            expect(accessoryStub.updateCharacteristic).to.be.calledWith("Brightness", 100);
        });

        it("should update the state to off", () => {
            dimmer.onUpdate({ state: "Off", level: 0 });

            expect(accessoryStub.updateCharacteristic).to.be.calledWith("On", false);
            expect(accessoryStub.updateCharacteristic).to.be.calledWith("Brightness", 0);
        });
    });

    describe("onGetState()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("LightBulb").returns(accessoryStub);

            dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current state of the device", () => {
            expect(stateStub.callbacks["Get"]()).to.be.true;
        });

        it("should return the current state after an update", () => {
            deviceStub.status = { state: "Off", level: 0 };

            expect(stateStub.callbacks["Get"]()).to.be.false;
        });
    });

    describe("onSetState()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("LightBulb").returns(accessoryStub);

            dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device state to off", () => {
            stateStub.callbacks["Set"](false);

            expect(logStub.debug).to.be.calledWith("Dimmer Set State: NAME Off");
            expect(logStub.debug).to.be.calledWith("Dimmer Set Brightness: NAME 0");
        });

        it("should update the device state to on", () => {
            deviceStub.status = { state: "Off" };
            stateStub.callbacks["Set"](true);

            expect(logStub.debug).to.be.calledWith("Dimmer Set State: NAME On");
            expect(logStub.debug).to.be.calledWith("Dimmer Set Brightness: NAME 100");
        });

        it("should not update the device if the values is the same", () => {
            deviceStub.status = { state: "On", level: 100 };
            stateStub.callbacks["Set"](true);

            expect(logStub.debug).to.not.be.calledWith("Switch Set State: NAME On");
        });
    });

    describe("onGetBrightness()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("LightBulb").returns(accessoryStub);

            dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current level of the device", () => {
            expect(levelStub.callbacks["Get"]()).to.equal(50);
        });

        it("should return the current state after an update", () => {
            deviceStub.status = { state: "Off", level: 0 };

            expect(levelStub.callbacks["Get"]()).to.equal(0);
        });
    });

    describe("onSetBrightness()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("LightBulb").returns(accessoryStub);

            dimmer = new Dimmer(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device state to off", () => {
            levelStub.callbacks["Set"](0);

            expect(logStub.debug).to.be.calledWith("Dimmer Set State: NAME Off");
            expect(logStub.debug).to.be.calledWith("Dimmer Set Brightness: NAME 0");
        });

        it("should update the device state to on", () => {
            levelStub.callbacks["Set"](100);

            expect(logStub.debug).to.be.calledWith("Dimmer Set State: NAME On");
            expect(logStub.debug).to.be.calledWith("Dimmer Set Brightness: NAME 100");
        });

        it("should not update the device if the values is the same", () => {
            levelStub.callbacks["Set"](50);

            expect(logStub.debug).to.not.be.calledWith("Dimmer Set Brightness: NAME 50");
        });
    });
});

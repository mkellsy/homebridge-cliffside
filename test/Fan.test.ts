import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";

import { Fan } from "../src/Fan";
import { Dimmer } from "../src/Dimmer";

chai.use(sinonChai);
registerNode();

describe("Fan", () => {
    let updateLevelStub: any;

    let homebridgeStub: any;
    let addServiceStub: any;
    let getServiceStub: any;
    let deviceStub: any;
    let hapStub: any;
    let logStub: any;

    let ecoStub: any;
    let autoStub: any;
    let speedStub: any;
    let stateStub: any;
    let whooshStub: any;

    let accessoryStub: any;
    let ecoAccessoryStub: any;
    let autoAccessoryStub: any;
    let whooshAccessoryStub: any;

    let fan: Fan;
    let fanType: typeof Fan;

    before(() => {
        fanType = proxy(() => require("../src/Fan").Fan, {
            "./Dimmer": {
                Dimmer: {
                    convertSpeed: (speed: number) => Math.round((speed / 7) * 100),
                    updateLevel: () => updateLevelStub,
                },
            },
        });
    });

    beforeEach(() => {
        updateLevelStub = sinon.promise();

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
                Switch: "Switch",
                Fan: "Fan",
            },
            Characteristic: {
                On: "On",
                Name: "Name",
                Model: "Model",
                Switch: "Switch",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
                RotationSpeed: "RotationSpeed",
                ConfiguredName: "ConfiguredName",
            },
        };

        ecoStub = {
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

        autoStub = {
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

        speedStub = {
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

        whooshStub = {
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

        ecoAccessoryStub = {
            setCharacteristic: sinon.stub(),
            getCharacteristic: sinon.stub(),
            updateCharacteristic: sinon.stub(),
        };

        autoAccessoryStub = {
            setCharacteristic: sinon.stub(),
            getCharacteristic: sinon.stub(),
            updateCharacteristic: sinon.stub(),
        };

        whooshAccessoryStub = {
            setCharacteristic: sinon.stub(),
            getCharacteristic: sinon.stub(),
            updateCharacteristic: sinon.stub(),
        };

        accessoryStub.setCharacteristic.returns(accessoryStub);
        ecoAccessoryStub.setCharacteristic.returns(ecoAccessoryStub);
        autoAccessoryStub.setCharacteristic.returns(autoAccessoryStub);
        whooshAccessoryStub.setCharacteristic.returns(whooshAccessoryStub);

        accessoryStub.getCharacteristic.withArgs("On").returns(stateStub);
        accessoryStub.getCharacteristic.withArgs("RotationSpeed").returns(speedStub);
        ecoAccessoryStub.getCharacteristic.withArgs("On").returns(ecoStub);
        autoAccessoryStub.getCharacteristic.withArgs("On").returns(autoStub);
        whooshAccessoryStub.getCharacteristic.withArgs("On").returns(whooshStub);

        addServiceStub = sinon.stub();
        getServiceStub = sinon.stub();

        homebridgeStub = {
            callbacks: {},

            hap: hapStub,
            on: sinon.stub(),
            registerPlatformAccessories: sinon.stub(),
            unregisterPlatformAccessories: sinon.stub(),

            platformAccessory: class {
                getService: any = getServiceStub;
                addService: any = addServiceStub;
            },
        };

        deviceStub = {
            id: "ID_FAN",
            name: "NAME",
            type: DeviceType.Fan,
            status: { state: "On", speed: 3 },
            update: sinon.stub(),
            set: sinon.stub(),
            capabilities: {},
        };
    });

    it("should bind listeners when device is created", () => {
        getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        addServiceStub.withArgs("Fan").returns(accessoryStub);

        fan = new fanType(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;

        expect(speedStub.callbacks["Get"]).to.not.be.undefined;
        expect(speedStub.callbacks["Set"]).to.not.be.undefined;
    });

    it("should bind listeners when device is created from cache", () => {
        getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        getServiceStub.withArgs("Fan").returns(accessoryStub);

        fan = new fanType(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;

        expect(speedStub.callbacks["Get"]).to.not.be.undefined;
        expect(speedStub.callbacks["Set"]).to.not.be.undefined;
    });

    it("should bind listeners for extended services", () => {
        getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        getServiceStub.withArgs("Fan").returns(accessoryStub);

        addServiceStub.withArgs("Switch", "NAME Auto", "1").returns(autoAccessoryStub);
        addServiceStub.withArgs("Switch", "NAME Whoosh", "2").returns(whooshAccessoryStub);
        addServiceStub.withArgs("Switch", "NAME Eco", "3").returns(ecoAccessoryStub);

        deviceStub.capabilities = {
            auto: true,
            whoosh: true,
            eco: true,
        };

        fan = new fanType(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;

        expect(speedStub.callbacks["Get"]).to.not.be.undefined;
        expect(speedStub.callbacks["Set"]).to.not.be.undefined;

        expect(autoStub.callbacks["Get"]).to.not.be.undefined;
        expect(autoStub.callbacks["Set"]).to.not.be.undefined;

        expect(whooshStub.callbacks["Get"]).to.not.be.undefined;
        expect(whooshStub.callbacks["Set"]).to.not.be.undefined;

        expect(ecoStub.callbacks["Get"]).to.not.be.undefined;
        expect(ecoStub.callbacks["Set"]).to.not.be.undefined;
    });

    it("should bind listeners for extended services from cache", () => {
        getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        getServiceStub.withArgs("Fan").returns(accessoryStub);

        getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
        getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
        getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

        deviceStub.capabilities = {
            auto: true,
            whoosh: true,
            eco: true,
        };

        fan = new fanType(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;

        expect(speedStub.callbacks["Get"]).to.not.be.undefined;
        expect(speedStub.callbacks["Set"]).to.not.be.undefined;

        expect(autoStub.callbacks["Get"]).to.not.be.undefined;
        expect(autoStub.callbacks["Set"]).to.not.be.undefined;

        expect(whooshStub.callbacks["Get"]).to.not.be.undefined;
        expect(whooshStub.callbacks["Set"]).to.not.be.undefined;

        expect(ecoStub.callbacks["Get"]).to.not.be.undefined;
        expect(ecoStub.callbacks["Set"]).to.not.be.undefined;
    });

    describe("convertLevel()", () => {
        const TEST_CASES = [
            { value: 0, speed: 1, expected: 0 },
            { value: 7, speed: 0, expected: 1 },
            { value: 14, speed: 0, expected: 1 },
            { value: 22, speed: 2, expected: 1 },
            { value: 22, speed: 1, expected: 2 },
            { value: 28, speed: 1, expected: 2 },
            { value: 38, speed: 3, expected: 2 },
            { value: 38, speed: 2, expected: 3 },
            { value: 42, speed: 2, expected: 3 },
            { value: 50, speed: 4, expected: 3 },
            { value: 50, speed: 3, expected: 4 },
            { value: 56, speed: 3, expected: 4 },
            { value: 68, speed: 5, expected: 4 },
            { value: 68, speed: 4, expected: 5 },
            { value: 70, speed: 4, expected: 5 },
            { value: 79, speed: 6, expected: 5 },
            { value: 79, speed: 5, expected: 6 },
            { value: 84, speed: 5, expected: 6 },
            { value: 90, speed: 7, expected: 6 },
            { value: 90, speed: 6, expected: 7 },
            { value: 98, speed: 6, expected: 7 },
            { value: 100, speed: 0, expected: 7 },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should convert ${TEST_CASE.value} to ${TEST_CASE.expected} when the current speed is ${TEST_CASE.speed}`, () => {
                expect(fanType.convertLevel(TEST_CASE.value, { speed: TEST_CASE.speed } as any)).to.equal(
                    TEST_CASE.expected,
                );
            });
        });
    });

    describe("updateSpeed()", () => {
        let setStub: any;

        const TEST_CASES = [
            { value: 0, speed: 0, state: "Off" },
            { value: 14, speed: 1, state: "On" },
            { value: 28, speed: 2, state: "On" },
            { value: 42, speed: 3, state: "On" },
            { value: 56, speed: 4, state: "On" },
            { value: 70, speed: 5, state: "On" },
            { value: 84, speed: 6, state: "On" },
            { value: 98, speed: 7, state: "On" },
        ];

        beforeEach(() => {
            setStub = sinon.promise();
            deviceStub.set.returns(setStub);
        });

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should set dimmer to ${TEST_CASE.value} for fan speed ${TEST_CASE.speed}`, (done) => {
                fanType
                    .updateSpeed({} as any, deviceStub, TEST_CASE.speed)
                    .then(() => {
                        expect(deviceStub.set).to.be.calledWith({ state: TEST_CASE.state, speed: TEST_CASE.speed });

                        done();
                    })
                    .catch((error) => console.log(error));

                updateLevelStub.resolve();
                setStub.resolve();
            });

            it("should reject if update level fails", (done) => {
                fanType.updateSpeed({} as any, deviceStub, TEST_CASE.speed).catch((error) => {
                    expect(error).to.equal("TEST_ERROR");

                    done();
                });

                updateLevelStub.reject("TEST_ERROR");
            });

            it("should reject if the set fails", (done) => {
                fanType.updateSpeed({} as any, deviceStub, TEST_CASE.speed).catch((error) => {
                    expect(error).to.equal("TEST_ERROR");

                    done();
                });

                updateLevelStub.resolve();
                setStub.reject("TEST_ERROR");
            });
        });
    });

    describe("onUpdate()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);
        });

        it("should update the state to on", () => {
            fan = new fanType(homebridgeStub, deviceStub, logStub);
            fan.onUpdate({ state: "On", speed: 7, whoosh: "Off" });

            expect(accessoryStub.updateCharacteristic).to.be.calledWith("On", true);
            expect(accessoryStub.updateCharacteristic).to.be.calledWith("RotationSpeed", 100);
        });

        it("should update the state to off", () => {
            fan = new fanType(homebridgeStub, deviceStub, logStub);
            fan.onUpdate({ state: "Off", speed: 0, whoosh: "Off" });

            expect(accessoryStub.updateCharacteristic).to.be.calledWith("On", false);
            expect(accessoryStub.updateCharacteristic).to.be.calledWith("RotationSpeed", 0);
        });

        it("should update auto to on", () => {
            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
            fan.onUpdate({ state: "Auto", speed: 4, whoosh: "Off" });

            expect(autoAccessoryStub.updateCharacteristic).to.be.calledWith("On", true);
        });

        it("should not update auto if capabilities change after setup", () => {
            fan = new fanType(homebridgeStub, deviceStub, logStub);

            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan.onUpdate({ state: "On", speed: 4, whoosh: "Off" });

            expect(autoAccessoryStub.updateCharacteristic).to.not.be.called;
        });

        it("should update whoosh to on", () => {
            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
            fan.onUpdate({ state: "On", speed: 4, whoosh: "On" });

            expect(whooshAccessoryStub.updateCharacteristic).to.be.calledWith("On", true);
        });

        it("should not update whoosh if capabilities change after setup", () => {
            fan = new fanType(homebridgeStub, deviceStub, logStub);

            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan.onUpdate({ state: "On", speed: 4, whoosh: "On" });

            expect(whooshAccessoryStub.updateCharacteristic).to.not.be.called;
        });

        it("should update eco to on", () => {
            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
            fan.onUpdate({ state: "On", speed: 4, whoosh: "Off", eco: "On" });

            expect(ecoAccessoryStub.updateCharacteristic).to.be.calledWith("On", true);
        });

        it("should default eco to off", () => {
            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
            fan.onUpdate({ state: "On", speed: 4, whoosh: "Off" });

            expect(ecoAccessoryStub.updateCharacteristic).to.be.calledWith("On", false);
        });

        it("should not update eco if capabilities change after setup", () => {
            fan = new fanType(homebridgeStub, deviceStub, logStub);

            deviceStub.capabilities = {
                auto: true,
                whoosh: true,
                eco: true,
            };

            fan.onUpdate({ state: "On", speed: 4, whoosh: "Off", eco: "On" });

            expect(ecoAccessoryStub.updateCharacteristic).to.not.be.called;
        });
    });

    describe("onGetState()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            fan = new fanType(homebridgeStub, deviceStub, logStub);
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
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device state to off", () => {
            stateStub.callbacks["Set"](false);

            expect(logStub.debug).to.be.calledWith("Fan Set State: NAME Off");
            expect(logStub.debug).to.be.calledWith("Fan Set Speed: NAME 0");
        });

        it("should update the device state to on", () => {
            deviceStub.status = { state: "Off" };
            stateStub.callbacks["Set"](true);

            expect(logStub.debug).to.be.calledWith("Fan Set State: NAME On");
            expect(logStub.debug).to.be.calledWith("Fan Set Speed: NAME 7");
        });

        it("should not update the device if the values is the same", () => {
            deviceStub.status = { state: "On", speed: 7 };
            stateStub.callbacks["Set"](true);

            expect(logStub.debug).to.not.be.calledWith("Fan Set State: NAME On");
        });
    });

    describe("onGetSpeed()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current speed of the device", () => {
            expect(speedStub.callbacks["Get"]()).to.equal(43);
        });

        it("should return the current state after an update", () => {
            deviceStub.status = { state: "Off", speed: 0 };

            expect(speedStub.callbacks["Get"]()).to.equal(0);
        });
    });

    describe("onSetSpeed()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device state to off", () => {
            speedStub.callbacks["Set"](0);

            expect(logStub.debug).to.be.calledWith("Fan Set State: NAME Off");
            expect(logStub.debug).to.be.calledWith("Fan Set Speed: NAME 0");
        });

        it("should update the device state to on", () => {
            speedStub.callbacks["Set"](100);

            expect(logStub.debug).to.be.calledWith("Fan Set State: NAME On");
            expect(logStub.debug).to.be.calledWith("Fan Set Speed: NAME 7");
        });

        it("should not update the device if the values is the same", () => {
            speedStub.callbacks["Set"](43);

            expect(logStub.debug).to.not.be.calledWith("Fan Set Speed: NAME 3");
        });
    });

    describe("onGetAuto()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            deviceStub.capabilities = { auto: true };
            deviceStub.status = { state: "On", speed: 3 };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current auto state of the device", () => {
            expect(autoStub.callbacks["Get"]()).to.equal(false);
        });

        it("should return the current auto state after an update", () => {
            deviceStub.status = { state: "Auto" };

            expect(autoStub.callbacks["Get"]()).to.equal(true);
        });
    });

    describe("onSetAuto()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            deviceStub.capabilities = { auto: true };
            deviceStub.status = { state: "On", speed: 3, auto: "Off" };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device auto state to on", () => {
            autoStub.callbacks["Set"](true);

            expect(logStub.debug).to.be.calledWith("Fan Set State: NAME Auto");
        });

        it("should update the device auto state to off", () => {
            deviceStub.status.state = "Auto";
            deviceStub.status.speed = undefined;

            autoStub.callbacks["Set"](false);

            expect(logStub.debug).to.be.calledWith("Fan Set State: NAME Off");
        });

        it("should not update the auto state if the values is the same", () => {
            deviceStub.status.state = "Off";
            autoStub.callbacks["Set"](false);

            expect(logStub.debug).to.not.be.calledWith("Fan Set State: NAME Off");
        });
    });

    describe("onGetWhoosh()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            deviceStub.capabilities = { whoosh: true };
            deviceStub.status = { state: "On", speed: 3, whoosh: "Off" };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current whoosh state of the device", () => {
            expect(whooshStub.callbacks["Get"]()).to.equal(false);
        });

        it("should return the current whoosh state after an update", () => {
            deviceStub.status = { state: "Off", whoosh: "On" };

            expect(whooshStub.callbacks["Get"]()).to.equal(true);
        });
    });

    describe("onSetWhoosh()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            deviceStub.capabilities = { whoosh: true };
            deviceStub.status = { state: "On", speed: 3, whoosh: "Off" };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device whoosh state to on", () => {
            whooshStub.callbacks["Set"](true);

            expect(logStub.debug).to.be.calledWith("Fan Set Whoosh: NAME On");
        });

        it("should update the device whoosh state to off", () => {
            deviceStub.status.whoosh = "On";
            deviceStub.status.speed = undefined;

            whooshStub.callbacks["Set"](false);

            expect(logStub.debug).to.be.calledWith("Fan Set Whoosh: NAME Off");
        });

        it("should not update the whoosh state if the values is the same", () => {
            whooshStub.callbacks["Set"](false);

            expect(logStub.debug).to.not.be.calledWith("Fan Set Whoosh: NAME Off");
        });
    });

    describe("onGetEco()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            deviceStub.capabilities = { eco: true };
            deviceStub.status = { state: "On", speed: 3, eco: "Off" };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current eco state of the device", () => {
            expect(ecoStub.callbacks["Get"]()).to.equal(false);
        });

        it("should return the current eco state after an update", () => {
            deviceStub.status = { state: "Off", eco: "On" };

            expect(ecoStub.callbacks["Get"]()).to.equal(true);
        });

        it("should default the eco state to off", () => {
            deviceStub.status = { state: "Off" };

            expect(ecoStub.callbacks["Get"]()).to.equal(false);
        });
    });

    describe("onSetEco()", () => {
        beforeEach(() => {
            getServiceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            getServiceStub.withArgs("Fan").returns(accessoryStub);

            getServiceStub.withArgs("NAME Auto").returns(autoAccessoryStub);
            getServiceStub.withArgs("NAME Whoosh").returns(whooshAccessoryStub);
            getServiceStub.withArgs("NAME Eco").returns(ecoAccessoryStub);

            deviceStub.capabilities = { eco: true };
            deviceStub.status = { state: "On", speed: 3, eco: "Off" };

            fan = new fanType(homebridgeStub, deviceStub, logStub);
        });

        it("should update the device eco state to on", () => {
            ecoStub.callbacks["Set"](true);

            expect(logStub.debug).to.be.calledWith("Fan Set Eco: NAME On");
        });

        it("should update the device eco state to off", () => {
            deviceStub.status.eco = "On";
            deviceStub.status.speed = undefined;

            ecoStub.callbacks["Set"](false);

            expect(logStub.debug).to.be.calledWith("Fan Set Eco: NAME Off");
        });

        it("should not update the eco state if the values is the same", () => {
            ecoStub.callbacks["Set"](false);

            expect(logStub.debug).to.not.be.calledWith("Fan Set Eco: NAME Off");
        });
    });
});

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Accessories } from "../src/Accessories";
import { DeviceType } from "@mkellsy/hap-device";

chai.use(sinonChai);

describe("Accessories", () => {
    let homebridgeStub: any;
    let serviceStub: any;
    let deviceStub: any;
    let hapStub: any;
    let logStub: any;

    let characteristicStub: any;
    let accessoryStub: any;

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
            },
            Characteristic: {
                Model: "Model",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
                ServiceLabelNamespace: {
                    ARABIC_NUMERALS: 1,
                },
            },
        };

        characteristicStub = {
            callbacks: {},
            onGet: sinon.stub(),
            onSet: sinon.stub(),
        };

        characteristicStub.onGet.returns(characteristicStub);
        characteristicStub.onSet.returns(characteristicStub);

        accessoryStub = {
            setCharacteristic: sinon.stub(),
            getCharacteristic: sinon.stub().returns(characteristicStub),
            updateCharacteristic: sinon.stub(),
        };

        accessoryStub.setCharacteristic.returns(accessoryStub);
        serviceStub = sinon.stub().returns(accessoryStub);

        homebridgeStub = {
            callbacks: {},

            hap: hapStub,
            on: sinon.stub(),
            registerPlatformAccessories: sinon.stub(),
            unregisterPlatformAccessories: sinon.stub(),

            platformAccessory: class {
                getService: any = serviceStub;
            },
        };

        deviceStub = {
            id: "ID_ACCESSORIES",
            status: { state: "On", level: 50 },
            update: sinon.stub(),
            set: sinon.stub(),
            capabilities: {},
            buttons: [],
        };
    });

    describe("create()", () => {
        const TEST_CASES = [
            { type: DeviceType.Fan, manufacturer: "Delta T, LLC" },
            { type: DeviceType.Strip, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Keypad, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Remote, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Humidity, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Occupancy, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Timeclock, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Temperature, manufacturer: "TEST_UNKNOWN" },
        ];

        for (const TEST_CASE of TEST_CASES) {
            it(`should create a proper ${TEST_CASE.type} device`, () => {
                deviceStub.type = TEST_CASE.type;
                deviceStub.manufacturer = TEST_CASE.manufacturer;
                deviceStub.id = `UUID_ACCESSORIES_${TEST_CASE.type.toUpperCase()}`;
                hapStub.uuid.generate.returns(`UUID_ACCESSORIES_${TEST_CASE.type.toUpperCase()}`);

                const device = Accessories.create(homebridgeStub, deviceStub, logStub);

                expect(device).to.not.be.undefined;
                expect(typeof device).to.equal("object");
            });
        }

        it("should not create a fan device that is not baf", () => {
            deviceStub.type = DeviceType.Fan;
            deviceStub.manufacturer = "Lutron Electronics Co., Inc";

            const device = Accessories.create(homebridgeStub, deviceStub, logStub);

            expect(device).to.be.undefined;
        });
    });

    describe("get()", () => {
        const TEST_CASES = [
            { type: DeviceType.Fan, manufacturer: "Delta T, LLC" },
            { type: DeviceType.Strip, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Keypad, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Remote, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Humidity, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Occupancy, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Timeclock, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Temperature, manufacturer: "TEST_UNKNOWN" },
        ];

        for (const TEST_CASE of TEST_CASES) {
            it(`should get the ${TEST_CASE.type} device`, () => {
                deviceStub.type = TEST_CASE.type;
                deviceStub.manufacturer = TEST_CASE.manufacturer;
                hapStub.uuid.generate.returns(`UUID_ACCESSORIES_${TEST_CASE.type.toUpperCase()}`);

                const device = Accessories.create(homebridgeStub, deviceStub, logStub);

                device?.register();
                expect(Accessories.get(homebridgeStub, deviceStub)).to.deep.equal(device);
            });
        }
    });

    describe("remove()", () => {
        const TEST_CASES = [
            { type: DeviceType.Fan, manufacturer: "Delta T, LLC" },
            { type: DeviceType.Strip, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Keypad, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Remote, manufacturer: "Lutron Electronics Co., Inc" },
            { type: DeviceType.Humidity, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Occupancy, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Timeclock, manufacturer: "TEST_UNKNOWN" },
            { type: DeviceType.Temperature, manufacturer: "TEST_UNKNOWN" },
        ];

        for (const TEST_CASE of TEST_CASES) {
            it(`should unregister the ${TEST_CASE.type} device`, () => {
                deviceStub.type = TEST_CASE.type;
                deviceStub.manufacturer = TEST_CASE.manufacturer;
                hapStub.uuid.generate.returns(`UUID_ACCESSORIES_${TEST_CASE.type.toUpperCase()}`);

                const device = Accessories.create(homebridgeStub, deviceStub, logStub);

                device?.register();
                Accessories.remove(homebridgeStub, deviceStub);

                expect(homebridgeStub.unregisterPlatformAccessories).to.be.calledWith(
                    "@mkellsy/homebridge-cliffside",
                    "Cliffside",
                    sinon.match.any,
                );
            });

            it(`should not unregister the ${TEST_CASE.type} device if it is not registered`, () => {
                deviceStub.type = TEST_CASE.type;
                deviceStub.manufacturer = TEST_CASE.manufacturer;
                hapStub.uuid.generate.returns(`UUID_ACCESSORIES_${TEST_CASE.type.toUpperCase()}_2`);

                Accessories.create(homebridgeStub, deviceStub, logStub);
                Accessories.remove(homebridgeStub, deviceStub);

                expect(homebridgeStub.unregisterPlatformAccessories).to.not.be.called;
            });
        }
    });
});

import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Links } from "../src/Links";

chai.use(sinonChai);
registerNode();

describe("Links", () => {
    let links: Links;
    let linksType: typeof Links;

    let linksStub: any;
    let readFileStub: any;

    let convertSpeedStub: any;
    let convertLevelStub: any;
    let updateLevelStub: any;
    let updateSpeedStub: any;

    before(() => {
        linksType = proxy(() => require("../src/Links").Links, {
            fs: {
                readFileSync() {
                    return readFileStub();
                },
            },
            "./Dimmer": {
                Dimmer: {
                    convertSpeed: (...args: any[]) => convertSpeedStub(...args),
                    updateLevel: () => updateLevelStub,
                },
            },
            "./Fan": {
                Fan: {
                    convertLevel: (...args: any[]) => convertLevelStub(...args),
                    updateSpeed: () => updateSpeedStub,
                },
            },
        });
    });

    beforeEach(() => {
        convertSpeedStub = sinon.stub();
        convertLevelStub = sinon.stub();

        updateLevelStub = sinon.promise();
        updateSpeedStub = sinon.promise();

        linksStub = JSON.stringify([
            ["LEAP-1-DIMMER-1", "BAF-1-FAN"],
            ["LEAP-2-DIMMER-2", "BAF-1-DOWNLIGHT"],
            ["LEAP-3-DIMMER-3", "BAF-2-FAN"],
            ["LEAP-4-DIMMER-4", "BAF-2-DOWNLIGHT"],
            ["LEAP-5-DIMMER-5", "BAF-3-FAN"],
            ["LEAP-6-DIMMER-6", "BAF-4-FAN"],
            ["LEAP-7-DIMMER-7", "BAF-4-DOWNLIGHT"],
            ["LEAP-8-DIMMER-8", "BAF-4-UPLIGHT"],
            ["LEAP-9-DIMMER-9", "LEAP-0-DIMMER-0"],
        ]);

        readFileStub = sinon.stub().returns(linksStub);
        links = new linksType();

        [
            { id: "LEAP-0-DIMMER-0", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-1-DIMMER-1", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-2-DIMMER-2", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-3-DIMMER-3", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-4-DIMMER-4", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-5-DIMMER-5", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-6-DIMMER-6", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-7-DIMMER-7", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-8-DIMMER-8", type: "Dimmer", status: { state: "On" } },
            { id: "LEAP-9-DIMMER-9", type: "Dimmer", status: { state: "On" } },
            { id: "BAF-1-FAN", type: "Fan", status: { state: "On" } },
            { id: "BAF-1-DOWNLIGHT", type: "Dimmer", status: { state: "On" } },
            { id: "BAF-2-FAN", type: "Fan", status: { state: "On" } },
            { id: "BAF-2-DOWNLIGHT", type: "Dimmer", status: { state: "On" } },
            { id: "BAF-3-FAN", type: "Fan", status: { state: "On" } },
            { id: "BAF-4-FAN", type: "Fan", status: { state: "On" } },
            { id: "BAF-4-DOWNLIGHT", type: "Dimmer", status: { state: "On" } },
            { id: "BAF-4-UPLIGHT", type: "Dimmer", status: { state: "On" } },
        ].forEach((entry) => {
            links.set(entry as any);
        });
    });

    it("should not do anything if the device is not linked", () => {
        links.update({ id: "TEST_UNLINKED" } as any, { level: 100 } as any);
    });

    describe("update()", () => {
        const TEST_CASES = [
            { id: "LEAP-1-DIMMER-1", type: "Dimmer", level: 10 },
            { id: "LEAP-2-DIMMER-2", type: "Dimmer", level: 20 },
            { id: "LEAP-3-DIMMER-3", type: "Dimmer", level: 30 },
            { id: "LEAP-4-DIMMER-4", type: "Dimmer", level: 40 },
            { id: "LEAP-5-DIMMER-5", type: "Dimmer", level: 50 },
            { id: "LEAP-6-DIMMER-6", type: "Dimmer", level: 60 },
            { id: "LEAP-7-DIMMER-7", type: "Dimmer", level: 70 },
            { id: "LEAP-8-DIMMER-8", type: "Dimmer", level: 80 },
            { id: "LEAP-9-DIMMER-9", type: "Dimmer", level: 90 },
            { id: "LEAP-X-SWITCH-X", type: "Switch", level: 10 },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update linked device for ${TEST_CASE.id}`, () => {
                links.update({ id: TEST_CASE.id, type: TEST_CASE.type } as any, { level: TEST_CASE.level } as any);

                if (TEST_CASE.type === "Dimmer") {
                    updateLevelStub.resolve();
                    updateSpeedStub.resolve();
                }
            });

            it(`should reject linked device update for ${TEST_CASE.id}`, () => {
                links.update({ id: TEST_CASE.id, type: TEST_CASE.type } as any, { level: TEST_CASE.level } as any);

                if (TEST_CASE.type === "Dimmer") {
                    updateLevelStub.reject();
                    updateSpeedStub.reject();
                }
            });
        });
    });
});

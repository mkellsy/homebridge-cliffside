import { expect } from "chai";
import { parseLinkType } from "../src/LinkType";

describe("LinkType", () => {
    const TEST_CASES = [
        { source: "Dimmer", destination: "Dimmer", expected: 1 },
        { source: "Dimmer", destination: "Fan", expected: 2 },
        { source: "Dimmer", destination: "Switch", expected: 0 },
        { source: "Switch", destination: "Unknown", expected: 0 },
    ];

    TEST_CASES.forEach((TEST_CASE) => {
        it(`should return the proper link type for ${TEST_CASE.source} to ${TEST_CASE.destination}`, () => {
            expect(parseLinkType({ type: TEST_CASE.source } as any, { type: TEST_CASE.destination } as any)).to.equal(
                TEST_CASE.expected,
            );
        });
    });

    it("should return incompatiable for null source or destination", () => {
        expect(parseLinkType(undefined as any, undefined as any)).to.equal(0);
    });
});

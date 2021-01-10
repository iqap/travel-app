import { isValidDate } from "../src/client/js/util"

describe("Testing the valdate date functionality", () => {

    test("Check if date (2021-aa-bb) is not valid", () => {
        expect(isValidDate('2021-aa-bb')).toEqual(false);
    });

    test("Check if url (2021-01-01) is not valid", () => {
        expect(isValidDate('2021-01-01')).toEqual(true);
    });

});
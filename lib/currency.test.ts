import { CURRENCY, formatPrice } from "./currency";

describe("formatPrice", () => {
    it("uses the Ghana cedi symbol", () => {
        expect(CURRENCY).toBe("GH₵");
    });

    it("formats amounts with two decimals", () => {
        expect(formatPrice(25.99)).toBe("GH₵25.99");
    });

    it("pads whole numbers with decimals", () => {
        expect(formatPrice(5)).toBe("GH₵5.00");
        expect(formatPrice(0)).toBe("GH₵0.00");
    });

    it("rounds to two decimals", () => {
        expect(formatPrice(10.005)).toBe("GH₵10.01");
    });
});

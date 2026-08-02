import { CartCustomization } from "@/type";
import { useCartStore } from "./cart.store";

const burger = { id: "1", name: "Burger", price: 10, image_url: "x" };
const cheese: CartCustomization = { id: "c1", name: "Cheese", price: 2, type: "topping" };
const bacon: CartCustomization = { id: "c2", name: "Bacon", price: 3, type: "topping" };

describe("cart store", () => {
    beforeEach(() => {
        useCartStore.setState({ items: [] });
    });

    it("adds a new item", () => {
        useCartStore.getState().addItem(burger);
        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.getTotalItems()).toBe(1);
    });

    it("increments quantity when the same item and customizations are added again", () => {
        const s = useCartStore.getState();
        s.addItem({ ...burger, customizations: [cheese] });
        s.addItem({ ...burger, customizations: [cheese] });
        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(2);
        expect(state.getTotalItems()).toBe(2);
    });

    it("keeps separate entries for different customizations", () => {
        const s = useCartStore.getState();
        s.addItem({ ...burger, customizations: [cheese] });
        s.addItem({ ...burger, customizations: [bacon] });
        const state = useCartStore.getState();
        expect(state.items).toHaveLength(2);
        expect(state.getTotalItems()).toBe(2);
    });

    it("matches customizations regardless of order", () => {
        const s = useCartStore.getState();
        s.addItem({ ...burger, customizations: [cheese, bacon] });
        s.addItem({ ...burger, customizations: [bacon, cheese] });
        expect(useCartStore.getState().items).toHaveLength(1);
        expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it("computes total price including customizations", () => {
        const s = useCartStore.getState();
        s.addItem({ ...burger, customizations: [cheese] }); // 12
        s.addItem({ ...burger, customizations: [bacon] }); // 13
        s.increaseQty("1", [cheese]); // 24 + 13 = 37
        expect(useCartStore.getState().getTotalPrice()).toBe(37);
    });

    it("removes only the matching item variant", () => {
        const s = useCartStore.getState();
        s.addItem({ ...burger, customizations: [cheese] });
        s.addItem(burger);
        s.removeItem("1", [cheese]);
        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.items[0].customizations ?? []).toHaveLength(0);
    });

    it("decreases quantity and removes the item at zero", () => {
        const s = useCartStore.getState();
        s.addItem(burger);
        s.decreaseQty("1", []);
        const state = useCartStore.getState();
        expect(state.items).toHaveLength(0);
        expect(state.getTotalItems()).toBe(0);
    });

    it("clears the cart", () => {
        const s = useCartStore.getState();
        s.addItem(burger);
        s.clearCart();
        expect(useCartStore.getState().items).toHaveLength(0);
    });
});

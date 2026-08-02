import { MobileMoneyProvider } from "@/type";
import { formatPrice } from "@/lib/currency";

export interface MobileMoneyRequest {
    amount: number;
    phone: string;
    provider: MobileMoneyProvider;
}

export interface PaymentResult {
    success: boolean;
    reference: string;
    message: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizePhone = (phone: string) => phone.replace(/\s/g, "");

// NOTE: This is a SIMULATED Mobile Money payment for development.
// To go live, replace this with a real provider integration
// (e.g. Hubtel, ExpressPay, or the MTN MoMo Open API), triggered from a
// secure backend function. Never call the provider API with your
// merchant credentials directly from the app.
export const initiateMobileMoneyPayment = async ({
    amount,
    phone,
    provider,
}: MobileMoneyRequest): Promise<PaymentResult> => {
    await delay(2000);

    const normalized = normalizePhone(phone);
    if (!/^0\d{9}$/.test(normalized)) {
        return {
            success: false,
            reference: "",
            message: "Please enter a valid mobile money number (e.g. 024XXXXXXX).",
        };
    }

    return {
        success: true,
        reference: `MOMO-${Date.now()}`,
        message: `${provider} payment of ${formatPrice(amount)} approved.`,
    };
};

export const CURRENCY = "GH₵";

export const formatPrice = (amount: number) => `${CURRENCY}${amount.toFixed(2)}`;

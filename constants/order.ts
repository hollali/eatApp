import { OrderStatus } from "@/type";

export const DELIVERY_FEE = 5;
export const DISCOUNT = 0.5;

export const ORDER_STATUS_META: Record<
    OrderStatus,
    { label: string; color: string }
> = {
    pending: { label: "Pending", color: "#F59E0B" },
    confirmed: { label: "Confirmed", color: "#3B82F6" },
    preparing: { label: "Preparing", color: "#8B5CF6" },
    delivering: { label: "Delivering", color: "#F97316" },
    delivered: { label: "Delivered", color: "#22C55E" },
    cancelled: { label: "Cancelled", color: "#EF4444" },
};

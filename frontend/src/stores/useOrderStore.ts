import { create } from "zustand";
import type { Order } from "@/game-logic";

interface OrderState {
  pendingOrders: Order[];
  submittedOrders: Order[];
  isSubmitted: boolean;
  addOrder: (order: Order) => void;
  removeOrder: (unitId: string) => void;
  clearOrders: () => void;
  setSubmitted: (value: boolean) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  pendingOrders: [],
  submittedOrders: [],
  isSubmitted: false,

  addOrder: (order) =>
    set((state) => ({
      pendingOrders: [
        ...state.pendingOrders.filter((o) => o.unit !== order.unit),
        order,
      ],
    })),

  removeOrder: (unitId) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.filter((o) => o.unit !== unitId),
    })),

  clearOrders: () => set({ pendingOrders: [], isSubmitted: false }),

  setSubmitted: (value) =>
    set((state) => ({
      isSubmitted: value,
      submittedOrders: value ? [...state.pendingOrders] : state.submittedOrders,
    })),
}));

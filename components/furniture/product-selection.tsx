"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ProductSelectionValue = {
  colour: string;
  size: string;
  setColour: (colour: string) => void;
  setSize: (size: string) => void;
  clear: () => void;
};

const ProductSelectionContext = createContext<ProductSelectionValue | null>(null);

/**
 * The combination a shopper has picked, held above both halves of the detail
 * frame. The chips live in the purchase panel and the imagery in the gallery
 * beside it — two siblings in a server-rendered grid — so the selection cannot
 * belong to either of them. Everything else on the page stays on the server.
 */
export const ProductSelectionProvider = ({ children }: { children: ReactNode; }) => {
  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");

  const value = useMemo<ProductSelectionValue>(
    () => ({
      colour,
      size,
      setColour,
      setSize,
      clear: () => {
        setColour("");
        setSize("");
      },
    }),
    [colour, size],
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
};

export const useProductSelection = () => {
  const context = useContext(ProductSelectionContext);
  if (!context)
    throw new Error("useProductSelection must be used inside a ProductSelectionProvider");
  return context;
};

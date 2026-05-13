import { createContext, useContext, useState, ReactNode } from "react";

export type MealMode = "cook" | "leftovers" | "takeout" | "dineout";

type Ctx = {
  mode: MealMode;
  setMode: (m: MealMode) => void;
};

const MealModeContext = createContext<Ctx | null>(null);

export const MealModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<MealMode>("cook");
  return (
    <MealModeContext.Provider value={{ mode, setMode }}>
      {children}
    </MealModeContext.Provider>
  );
};

export const useMealMode = () => {
  const ctx = useContext(MealModeContext);
  if (!ctx) throw new Error("useMealMode must be used within MealModeProvider");
  return ctx;
};

// src\store\case-store.ts
import { create } from "zustand";
import { casesApi, type Case } from "../lib/api";

interface CaseStore {
  cases: Case[];
  selectedCase: Case | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  fetchCases: () => Promise<void>;
  searchCases: (query: string) => Promise<void>;
  addCase: (caseData: Omit<Case, "id" | "createdAt">) => Promise<void>;
  selectCase: (id: string) => void;
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  cases: [],
  selectedCase: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  fetchCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const cases = await casesApi.getAllCases();
      set({ cases, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch cases", isLoading: false });
    }
  },

  searchCases: async (query: string) => {
    set({ searchQuery: query, isLoading: true, error: null });
    try {
      const cases = await casesApi.searchCases(query);
      set({ cases, isLoading: false });
    } catch (error) {
      set({ error: "Failed to search cases", isLoading: false });
    }
  },

  addCase: async (caseData) => {
    set({ isLoading: true, error: null });
    try {
      const newCase = await casesApi.createCase(caseData);
      set((state) => ({
        cases: [...state.cases, newCase],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create case", isLoading: false });
    }
  },

  selectCase: (id) => {
    set((state) => ({
      selectedCase: state.cases.find((c) => c.id === id) || null,
    }));
  },
}));

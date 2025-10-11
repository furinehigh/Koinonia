// store/useUserStore.ts
import { create } from "zustand"

interface UserStore {
  Mana: number
  loading: boolean
  fetchMana: () => Promise<void>
  setMana: (Mana: number) => void
  updateMana: (Mana: number) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  Mana: 0,
  loading: false,

  fetchMana: async () => {
    set({ loading: true })
    const res = await fetch("/api/user/mana")
    const data = await res.json()
    set({ Mana: data.Mana ?? 0, loading: false })
  },

  setMana: (Mana) => set({ Mana }),

  updateMana: async (Mana) => {
    set({ Mana })
    await fetch("/api/user/mana", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Mana }),
    })
  },
}))

// store/useUserStore.ts
import { create } from "zustand"

interface UserStore {
  mana: number
  loading: boolean
  fetchMana: () => Promise<void>
  setMana: (mana: number) => void
  updateMana: (mana: number) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  mana: 0,
  loading: false,

  fetchMana: async () => {
    set({ loading: true })
    const res = await fetch("/api/user/mana")
    const data = await res.json()
    set({ mana: data.mana ?? 0, loading: false })
  },

  setMana: (mana) => set({ mana }),

  updateMana: async (mana) => {
    set({ mana })
    await fetch("/api/user/mana", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mana }),
    })
  },
}))

// store/useUserStore.ts
import { create } from "zustand"

interface UserStore {
  koins: number
  loading: boolean
  fetchKoins: () => Promise<void>
  setKoins: (koins: number) => void
  updateKoins: (koins: number) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  koins: 0,
  loading: false,

  fetchKoins: async () => {
    set({ loading: true })
    const res = await fetch("/api/user/koins")
    const data = await res.json()
    set({ koins: data.koins ?? 0, loading: false })
  },

  setKoins: (koins) => set({ koins }),

  updateKoins: async (koins) => {
    set({ koins })
    await fetch("/api/user/koins", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ koins }),
    })
  },
}))

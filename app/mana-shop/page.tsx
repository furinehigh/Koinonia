import { getAllSpells } from "@/lib/data/spells"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ManaShopClient from "@/components/ManaShopClient"

async function page() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return <div className="p-10 text-center text-red-600">Please sign in to access the Mana Shop.</div>

  const spells = await getAllSpells()
  if (!spells || spells.length === 0)
    return <div className="p-10 text-center">No spells available.</div>

  const mana = await prisma.mana.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="p-10 space-y-6 ml-15">
      <h1 className="text-3xl font-bold text-center">🪄 Mana Shop</h1>
      <p className="text-center text-muted-foreground">
        Balance: <span className="font-semibold text-blue-600">{mana?.mana ?? 0}</span> Mana
      </p>

      <ManaShopClient spells={spells} userMana={mana?.mana ?? 0} />
    </div>
  )
}

export default page

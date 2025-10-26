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


  return (
    <div className="p-10  ml-15">
      <ManaShopClient spells={spells} />
    </div>
  )
}

export default page
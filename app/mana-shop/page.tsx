import { getAllSpells } from "@/lib/data/spells"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spells.map((spell) => (
          <Card key={spell.id} className="rounded-lg shadow hover:shadow-lg transition duration-200">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{spell.name}</span>
                <span className="text-sm text-blue-600 font-semibold">{spell.price} Mana</span>
              </CardTitle>
              <CardDescription>{spell.effect}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async () => {
                  "use server"
                  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/shop/buy`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ spellId: spell.id }),
                  })
                  const data = await res.json()
                  console.log(data)
                }}
              >
                <Button type="submit" className="w-full flame-button">
                  Buy Spell
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default page

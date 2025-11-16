import { prisma } from "../prisma"


export const getAllDMs = async (userId: string) => {
    try {
        const dmsAsReciever = await prisma.dM.findMany({
            where: {
                friendship: {
                    receiverId: userId
                }
            },
            include: {
                friendship: {
                    include: {
                        requester: true
                    }
                }
            }
        })

        const dmsAsRequester = await prisma.dM.findMany({
            where: {
                friendship: {
                    requesterId: userId
                }
            },
            include: {
                friendship: {
                    include: {
                        receiver: true
                    }
                }
            }
        })

        if (dmsAsReciever) {
            return [...dmsAsReciever.map(d => ({...d, reciever: true}))]
        } else if (dmsAsRequester){
            return [...dmsAsRequester.map(d => ({...d, requester: true}))]
        } else {
            return []
        }
    } catch (e: any) {
        return []
    }
}

export const getDMDetails = async (userId: string, DMId: string) => {
    try {
        const dmAsReciever = await prisma.dM.findUnique({
            where: {
                friendship: {
                    receiverId: userId
                },
                id: DMId
            },
            include: {
                friendship: {
                    include: {
                        requester: true
                    }
                }
            }
        })

        const dmAsRequester = await prisma.dM.findUnique({
            where: {
                friendship: {
                    requesterId: userId
                },
                id: DMId
            },
            include: {
                friendship: {
                    include: {
                        receiver: true
                    }
                }
            }
        })

        if (dmAsReciever) {
            return {...dmAsReciever, reciever: true}
        } else if (dmAsRequester){
            return {...dmAsRequester, requester: true}
        } else {
            return []
        }
    } catch (e: any) {
        return []
    }
}
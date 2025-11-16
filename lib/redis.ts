import { createClient } from 'redis'

export const redisPub = createClient({ url: process.env.REDIS_URL })
export const redisSub = createClient({ url: process.env.REDIS_URL })

redisPub.connect()
redisSub.connect()
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

let prismaInstance = null;

function getPrismaInstance () {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
          transactionOptions: {
            maxResponseSize: 20 * 1024 * 1024, // 20MB instead of 5MB
            timeout: 60_000, // optional: 60s query timeout
          },
        }).$extends(withAccelerate());
      }

    return prismaInstance;
}

export default getPrismaInstance;
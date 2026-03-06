import { prisma } from '../lib/prisma'

async function main() {
    console.log('🔍 Fetching all users...\n')

    // ดึง User ทั้งหมด พร้อมกับ Credentials
    const users = await prisma.user.findMany({
        include: {
            credentials: true,
            orgs: {
                include: {
                    org: true,
                    role: true,
                }
            },
        },
    })

    if (users.length === 0) {
        console.log('❌ No users found in database')
        console.log('\n💡 Tip: Create a user first using Prisma Studio:')
        console.log('   npx prisma studio')
    } else {
        console.log(`✅ Found ${users.length} user(s):\n`)
        console.dir(users, { depth: null })
    }
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

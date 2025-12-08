
import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from './lib/embeddings';

const prisma = new PrismaClient();

async function main() {
    const query = "speakers";
    console.log(`Testing Vector Search for: "${query}"`);

    const embedding = await generateEmbedding(query);
    const vectorString = JSON.stringify(embedding);

    const deals = await prisma.$queryRaw`
        SELECT id, title, description, price, "imageURL"
        FROM "Deal"
        ORDER BY embedding <=> ${vectorString}::vector
        LIMIT 5;
    `;

    console.log("Results:");
    console.log(deals);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

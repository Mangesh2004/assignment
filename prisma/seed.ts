
import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '../lib/embeddings';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Cleanup existing data
    try {
        await prisma.order.deleteMany();
        await prisma.deal.deleteMany();
        // await prisma.user.deleteMany(); // Keep user for now or upsert
        await prisma.session.deleteMany();
        await prisma.chat.deleteMany();
    } catch (err) {
        console.warn("Cleanup warning (tables might be empty):", err);
    }

    // --- SEED DEALS FROM CSVs ---
    const dataDir = path.join(process.cwd(), 'data');
    // Helper to find files recursively if needed, but assumes flat 'data' dir for now per user context
    let files: string[] = [];
    try {
        files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));
    } catch (e) {
        console.error("Could not list data directory:", e);
        files = []; // Fallback
    }

    console.log(`Found ${files.length} CSV files to process.`);

    let totalSeeded = 0;

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`Processing ${file}: ${records.length} items found. Seeding top 20...`);

        // Take top 20 items to save time/cost
        const itemsToSeed = records.slice(0, 20);

        for (const item of itemsToSeed) {
            // Map CSV columns to Schema
            // CSV Headers: name, main_category, sub_category, image, link, ratings, no_of_ratings, discount_price, actual_price

            // Define interface for clarity if desired, but 'any' is fine for script
            const name = (item as any).name;
            const subCat = (item as any).sub_category;
            const mainCat = (item as any).main_category;
            const img = (item as any).image;
            const discPrice = (item as any).discount_price;
            const actPrice = (item as any).actual_price;

            const title = name || "Unknown Product";
            const description = `${name} - ${subCat} (${mainCat})`;
            const imageUrl = img || "";

            // Clean price string (remove ₹ and commas)
            let price = 0;
            if (discPrice) {
                price = parseFloat(discPrice.replace(/[₹,]/g, ''));
            } else if (actPrice) {
                price = parseFloat(actPrice.replace(/[₹,]/g, ''));
            }

            if (isNaN(price)) price = 0;

            // Generate Embedding
            const textToEmbed = `${title}: ${description}`;
            let embedding: number[] = [];
            try {
                embedding = await generateEmbedding(textToEmbed);
            } catch (e) {
                console.error(`Failed to embed ${title}:`, e);
                continue; // Skip this item if embedding fails
            }

            const embeddingString = JSON.stringify(embedding);

            // Insert
            await prisma.$executeRaw`
            INSERT INTO "Deal" ("id", "title", "description", "price", "imageURL", "embedding", "createdAt")
            VALUES (gen_random_uuid(), ${title}, ${description}, ${price}, ${imageUrl}, ${embeddingString}::vector, NOW());
        `;
            totalSeeded++;
        }
    }

    console.log(`Total deals seeded: ${totalSeeded}`);

    // --- SEED USER ---
    const existingUser = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                name: 'Mangesh',
                email: 'mangeshwaybhase01@gmail.com',
                phone: '9960858809',
                address: 'Pune',
            },
        });
        console.log("Created User: Mangesh");
    } else {
        console.log("User Mangesh already exists.");
    }

    console.log(`Seeding finished.`);
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

import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('alfahosting');
        
        if (req.method === 'GET') {
            const products = await db.collection('products').find({}).toArray();
            res.status(200).json(products);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal ambil data produk' });
    } finally {
        await client.close();
    }
}

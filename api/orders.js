import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('alfahosting');
        
        if (req.method === 'POST') {
            const newOrder = req.body;
            await db.collection('orders').insertOne(newOrder);
            res.status(200).json({ message: 'Pesanan sukses masuk database!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal simpan pesanan' });
    } finally {
        await client.close();
    }
}

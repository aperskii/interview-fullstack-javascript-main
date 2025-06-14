import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ City Schema & Model
interface ICity {
  cityName: string;
  count: number;
}

const citySchema = new mongoose.Schema<ICity>({
  cityName: { type: String, required: true },
  count: { type: Number, required: true }
}, { collection: 'cities' });

const City = mongoose.model<ICity>('City', citySchema);

// ✅ API Routes
app.get('/api/cities', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 5;

    const query = { cityName: { $regex: search, $options: 'i' } };

    const total = await City.countDocuments(query);

    const cities = await City.find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    res.json({
      cities,
      total,
      page,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create city
app.post('/cities', async (req: Request, res: Response) => {
  try {
    const { cityName, count } = req.body;
    const newCity = new City({ cityName, count });
    await newCity.save();
    res.status(201).json(newCity);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create city' });
  }
});

// Read city by ID
app.get('/cities/:id', async (req: Request, res: Response) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch city' });
  }
});

// Update city
app.put('/cities/:id', async (req: Request, res: Response) => {
  try {
    const updatedCity = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCity) return res.status(404).json({ error: 'City not found' });
    res.json(updatedCity);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update city' });
  }
});

// Delete city
app.delete('/cities/:id', async (req: Request, res: Response) => {
  try {
    const deletedCity = await City.findByIdAndDelete(req.params.id);
    if (!deletedCity) return res.status(404).json({ error: 'City not found' });
    res.json({ message: 'City deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete city' });
  }
});


// ✅ Start Server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

import Router from '@koa/router';
import { operatorAuth } from '../middleware/auth';
import { readHotels, writeHotels } from '../models/Hotel';
import { Context } from 'koa';

// Define the User interface
interface User {
    _id: string; // Assuming _id is a string
}

// Define the Hotel interface
interface Hotel {
    id: string;
    name: string;
    location: string;
    price: number;
    availability: boolean;
    operator: string;
    details?: {
        amenities?: string[];
        checkIn?: Date;
        checkOut?: Date;
        description?: string;
    };
}

// Define an interface for the hotel data
interface HotelRequestBody {
    name: string;
    location: string;
    price: number;
    availability: boolean;
    details?: {
        amenities?: string[];
        checkIn?: Date;
        checkOut?: Date;
        description?: string;
    };
}

const router = new Router();

// Get all hotels
router.get('/', async (ctx: Context) => {
    const hotels = await readHotels();
    ctx.body = hotels;
});

// Create a new hotel
router.post('/', operatorAuth, async (ctx: Context) => {
    const hotelData: HotelRequestBody = ctx.request.body as HotelRequestBody;
    const hotels = await readHotels();

    const operatorUser = ctx.state.user as User; // Cast to User type

    const newHotel: Hotel = {
        id: (hotels.length + 1).toString(), // Simple ID generation
        ...hotelData,
        operator: operatorUser._id // Use the typed user ID
    };

    hotels.push(newHotel); // Add the new hotel
    await writeHotels(hotels); // Write back to the file
    ctx.status = 201; // Created
    ctx.body = newHotel; // Return the new hotel
});

// Get a specific hotel by ID
router.get('/:id', async (ctx: Context) => {
    const { id } = ctx.params;
    const hotels = await readHotels();
    const hotel = hotels.find(h => h.id === id);

    if (!hotel) {
        ctx.status = 404; // Not Found
        ctx.body = { message: 'Hotel not found' };
        return;
    }

    ctx.body = hotel; // Return the found hotel
});

// Update a specific hotel by ID
router.put('/:id', operatorAuth, async (ctx: Context) => {
    const { id } = ctx.params;
    const hotelData: HotelRequestBody = ctx.request.body as HotelRequestBody;

    const hotels = await readHotels();
    const hotelIndex = hotels.findIndex(h => h.id === id);

    if (hotelIndex === -1) {
        ctx.status = 404; // Not Found
        ctx.body = { message: 'Hotel not found' };
        return;
    }

    hotels[hotelIndex] = { ...hotels[hotelIndex], ...hotelData }; // Update the hotel
    await writeHotels(hotels); // Write back to the file
    ctx.body = hotels[hotelIndex]; // Return the updated hotel
});

// Delete a specific hotel by ID
router.delete('/:id', operatorAuth, async (ctx: Context) => {
    const { id } = ctx.params;
    const hotels = await readHotels();
    const newHotels = hotels.filter(h => h.id !== id);

    if (hotels.length === newHotels.length) {
        ctx.status = 404; // Not Found
        ctx.body = { message: 'Hotel not found' };
        return;
    }

    await writeHotels(newHotels); // Write back to the file
    ctx.status = 204; // No Content
});

export const hotelsRouter = router;
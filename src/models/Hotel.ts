import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'hotels.json');

// Define the Hotel interface
interface Hotel {
    id: string;
    name: string;
    location: string;
    price: number;
    availability: boolean;
    operator: string; // Assuming operator is represented as a string (user ID)
    details?: {
        amenities?: string[];
        checkIn?: Date;
        checkOut?: Date;
        description?: string;
    };
}

// Function to read hotels from the JSON file
const readHotels = (): Promise<Hotel[]> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) return reject(err);
            resolve(JSON.parse(data));
        });
    });
};

// Function to write hotels to the JSON file
const writeHotels = (hotels: Hotel[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(hotels, null, 2), (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Export the functions to be used in the routes
export { readHotels, writeHotels, Hotel };
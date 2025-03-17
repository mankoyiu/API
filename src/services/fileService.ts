import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'hotels.json');

export const readHotels = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) return reject(err);
            resolve(JSON.parse(data));
        });
    });
};

export const writeHotels = (hotels: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(hotels, null, 2), (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};
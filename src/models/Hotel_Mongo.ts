import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: {
    amenities: [String],
    checkIn: Date,
    checkOut: Date,
    description: String
  }
});

export const Hotel = mongoose.model('Hotel', hotelSchema);
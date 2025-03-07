import mongoose from 'mongoose';

const hubSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, "Don't leave me lost — add a street!"],
    trim: true,
  },
  postcode: {
    type: String,
    required: [true, 'Zip it up! We need that postcode.'],
    trim: true,
  },
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book', 
    },
  ],
  hasBooks: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

hubSchema.index({ geoLocation: '2dsphere' });

hubSchema.pre('save', function (next) {
  const hub = this;
  if (!hub.isModified('books')) {   
    return next();
  }
  hub.hasBooks = hub.books.length > 0;
  next();
});

hubSchema.pre('save', async function (next) {
  const hub = this;
  if (!hub.isModified('street') && !hub.isModified('postcode')) {
    return next();
  }

  try {
    const address = `${hub.street}, ${hub.postcode}`;
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'WD-BE',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unable to fetch data from OpenStreetMap');
    }
    
    const data = await response.json();
    if (!data.length) {
      throw new Error('No data found for the given address');
    }
    const { lat, lon } = data[0];
    hub.geoLocation.coordinates = [parseFloat(lon), parseFloat(lat)];
    
    next();
  } catch (error) {
    next(error);
  }
});


export default mongoose.model('Hub', hubSchema);
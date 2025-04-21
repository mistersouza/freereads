import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Hub:
 *       type: object
 *       required:
 *         - street
 *         - postcode
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         street:
 *           type: string
 *           description: Street address of the hub
 *         postcode:
 *           type: string
 *           description: Postal code of the hub location
 *         geoLocation:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               description: GeoJSON type, always "Point" for hubs
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: "Coordinates as [longitude, latitude]"
 *         books:
 *           type: array
 *           items:
 *             type: string
 *           description: "Array of book IDs available at this hub"
 *         hasBooks:
 *           type: boolean
 *           description: Indicates whether the hub has any books available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the hub was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the hub was last updated
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         street: "123 Reading Road"
 *         postcode: "AB12 3CD"
 *         geoLocation:
 *           type: "Point"
 *           coordinates: [-0.127758, 51.507351]
 *         books: ["60d21b4667d0d8992e610c86"]
 *         hasBooks: true
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 */

const hubSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true,
  },
  postcode: {
    type: String,
    required: [true, 'Postcode is required'],
    trim: true,
  },
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
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
  return next();
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
      },
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

    return next();
  } catch (error) {
    return next(error);
  }
});

export default mongoose.model('Hub', hubSchema);

// const mongoose = require('mongoose');
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeo_cure';


// const connectDB = async () => {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log('MongoDB connected');
//     } catch (err) {
//         console.error('MongoDB connection error:', err);
//         process.exit(1); // exit process if connection fails
//     }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;

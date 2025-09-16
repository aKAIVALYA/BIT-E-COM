const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  process.env.jwt_SECRET =jwt_secret_key;

  await mongoose.connect(uri);
});
  

afterEach(async () =>{
  const collections = mongoose.connection.collections;
  for (const key in collections) {
     await collections.deleteMany({});
  }
})

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
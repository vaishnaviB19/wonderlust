const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const mongo_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongo_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map(obj => ({
        ...obj,
        owner: new mongoose.Types.ObjectId('689d76f7c66e20f29a7d7be5') // fixed
    }));
    await Listing.insertMany(initData.data);
    console.log('Data was initialized');
    mongoose.connection.close();
};

initDB();

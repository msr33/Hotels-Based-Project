/*
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
.then(() => {
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
}

const initDB = async () => {
    let data = initData.data;
    await Listing.deleteMany({});
    await Listing.insertMany({data});
    console.log("Data was initialized");
}

initDB();
*/

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "66a3b7168879a3052ab1e3fe"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();


const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

//used for .env file active or use.
require("dotenv").config();

//midle ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is runnign");
});

// usre = cardoctordb, password = kcjjiZ6LETDcm6Hm

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.krkb3gw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const serviceClloection = client.db("carDoctor").collection("services");

    //get user data from mongoDB server
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceClloection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}

//called the main mongoDB working function
run().catch((error) => console.error(error));

//app listen part
app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});

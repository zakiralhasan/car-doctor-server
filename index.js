const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//used for jwt authentication
const jwt = require("jsonwebtoken");

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

//function for JWT
function verifyJwt(req, res, next) {
  const jwtHeader = req.headers.authorization;
  if (!jwtHeader) {
    res.status(401).send({ message: "unauthorized user" });
  }
  const token = jwtHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (error, dcode) {
    if (error) {
      res.status(401).send({ message: "unauthorized user", error });
    }
    req.dcode = dcode;
    next();
  });
}

async function run() {
  try {
    const serviceClloection = client.db("carDoctor").collection("services");
    const orderCollcetion = client.db("carDoctor").collection("orders");

    //get user data from mongoDB server
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceClloection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get user's single data from mongoDB server
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceClloection.findOne(query);
      res.send(result);
    });

    //post or create user's order data at mongodb server
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollcetion.insertOne(order);
      res.send(result);
    });

    //get user's order data from mongoDB server
    app.get("/orders", verifyJwt, async (req, res) => {
      //JWT functon used here
      const dcode = req.dcode.email;
      console.log("Inside email query API", dcode);
      if (dcode !== req.query.email) {
        return res.status(403).send({ message: "unauthorized user" });
      }
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = orderCollcetion.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //delete single order from mongodb (orders) server
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollcetion.deleteOne(query);
      res.send(result);
    });

    //update single data at mongodb server
    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updatedData = {
        $set: { status: "Approved" },
      };
      const result = await orderCollcetion.updateOne(query, updatedData);
      res.send(result);
    });

    //jwt authentication
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
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

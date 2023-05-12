const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.SECRET_USER}:${process.env.SECRET_PASS}@cluster0.zmsfvx2.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const chocolatesCollection = client.db('chocolateDB').collection('chocolate');

    // to get all data in server side /chocolates
    app.get('/chocolates', async(req, res)=>{
      const cursor = chocolatesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/chocolates/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await chocolatesCollection.findOne(query);
      res.send(result);
    })

    // to get data from main form to server and last 2 line for mongodb
    app.post('/chocolates', async(req, res)=>{
      const newChocolate = req.body;
      console.log(newChocolate);
      const result = await chocolatesCollection.insertOne(newChocolate);
      res.send(result);
    });

    // for update
    app.put('/chocolates/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedChocolate = req.body;
      const chocolate ={
        $set: {
          name: updatedChocolate.name,
          country: updatedChocolate.country,
          category: updatedChocolate.category,
        }
      }
      const result = await chocolatesCollection.updateOne(filter, chocolate, options);
      res.send(result);
    })

    // for delete 
    app.delete('/chocolates/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await chocolatesCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port: ${port}`)
});
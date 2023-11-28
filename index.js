const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

//midleware
app.use(cors())
app.use(express.json())

const verifyToken = (req, res, next) => {
  console.log('inside verify token', req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.process.env.SECRETE_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}



const uri = `mongodb+srv://${process.env.USER}:${process.env.USER_PASS}@cluster0.yjorklr.mongodb.net/?retryWrites=true&w=majority`;

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
    const userCollections = client.db("robust-constructionDb").collection("users");
    const serviceCollections = client.db("robust-constructionDb").collection("services");

    app.get('/services', async(req,res)=>{
      const result = await serviceCollections.find().toArray()
      res.send(result)
    })
    
    app.get('/users', async(req,res)=>{
      
      const result = await userCollections.find().toArray()
      res.send(result)
    })

    app.get('/users/hr/:email',  async(req,res)=>{
      const email = req.params.email;
      const query ={email: email}
      const result = await userCollections.findOne(query)
      res.send(result)
    })


app.patch('/users/verify/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id:new ObjectId(id)}
  const user = await userCollections.findOne(query);
  const isVerified = user.isVerified || false;
  const updatedDoc = {
    $set: {
      isVerified: !isVerified
    }
  };
  const result = await userCollections.updateOne(query, updatedDoc);
  res.send(result);
});



    app.post('/users', async(req,res)=>{
      const users=req.body
      const result = await userCollections.insertOne(users)
      res.send(result)
    })

    app.post('/jwt', async(req,res)=>{

      const user =req.body
      const token = await jwt.sign(user,process.env.SECRETE_KEY,{expiresIn: '1h'})
      res.send({token})
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
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
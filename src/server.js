
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { connectToDB,db } from "./db.js";
import { MongoClient } from 'mongodb';
const url = 'mongodb://localhost:27017';
const dbName = 'Code_brigade';
const app = express()
app.use(bodyParser.json());
app.use(cors());


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json("Hey vijaya your server is running successfully!....");
})

app.post('/insert', async(req, res) => {
    await db.collection("ast").insertOne({Email:req.body.Email,Password:req.body.Password})
    .then((result)=>{
        res.json(result)
    })
    .catch((e)=>console.log(e))
})

app.post('/signin', async(req, res) => {
    console.log(req.body.Email)
    const user = await db.collection("ast").findOne({Email:req.body.Email})
    console.log(user)
    if(user) {
        if(user.Password === req.body.Password) {
            res.json({ message: "Login Successful", values: user})
        } else {
            res.json("Password Incorrect")
        }
    } else {
        res.json("user not found")
    }
})
app.post('/signup', async(req, res) => {
    await db.collection("ast").insertOne({Email:req.body.Email,Password:req.body.Password,firstName:req.body.firstName,lastName:req.body.lastName,Gender:req.body.Gender})
    .then((result)=>{
        if(result){
            res.json("registered successfully")
        }else{
            res.json("fill the data")
        }
    })
    .catch((e)=>console.log(e))
})
app.post('/forgot', async(req, res) => {
    const user = await db.collection("ast").findOne({Email:req.body.Email})
    console.log(user)
    if(user.Email===req.body.Email)
    {
        await db.collection("ast").updateOne({ Email: req.body.Email },{ $set:{ Password:req.body.NewPassword}})
        .then((result) => {
            if(result) {
                res.json({ message:"Update success" })
            } else {
                res.json("Failure")
            }
        })
        .catch((e)=>console.log(e))
    }
    else{
            res.json("password doesn't match")
    }

})
app.post('/data',async(req,res)=>{
    await db.collection("ast").find().toArray()
    .then((result)=>{
        res.json(result)
    })
    .catch((e)=>console.log(e))
})
MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    const collection = db.collection('calories');

    app.get('/api/food-items', async (req, res) => {
      try {
        const foodItems = await collection.find({}).toArray();
        res.json(foodItems);
      } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });

    app.post('/api/store-calories', async (req, res) => {
      const { totalCalories } = req.body;
      const today = new Date().toISOString().split('T')[0]; 
      try {
        await collection.updateOne(
          { date: today },
          { $set: { totalCalories } },
          { upsert: true }
        );
        res.status(200).json({ message: 'Your today\'s calorie intake is stored successfully.' });
      } catch (error) {
        console.error('Error storing calorie intake:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });

    app.get('/api/daily-calories', async (req, res) => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      try {
        const dailyCalories = await collection
          .find({ date: { $gte: sevenDaysAgo.toISOString().split('T')[0] } })
          .sort({ date: 1 })
          .toArray();
        res.json(dailyCalories);
      } catch (error) {
        console.error('Error fetching daily calorie data:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });

    app.get('/api/weekly-calories', async (req, res) => {
      const today = new Date();
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);

      try {
        const weeklyCalories = await collection
          .aggregate([
            { $match: { date: { $gte: oneMonthAgo.toISOString().split('T')[0] } } },
            { $group: { _id: { $substr: ['$date', 0, 7] }, totalCalories: { $sum: '$totalCalories' } } },
            { $sort: { '_id': 1 } }
          ])
          .toArray();
        res.json(weeklyCalories);
      } catch (error) {
        console.error('Error fetching weekly calorie data:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });

    app.get('/api/monthly-calories', async (req, res) => {
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      try {
        const monthlyCalories = await collection
          .aggregate([
            { $match: { date: { $gte: oneYearAgo.toISOString().split('T')[0] } } },
            { $group: { _id: { $substr: ['$date', 0, 7] }, totalCalories: { $sum: '$totalCalories' } } },
            { $sort: { '_id': 1 } }
          ])
          .toArray();
        res.json(monthlyCalories);
      } catch (error) {
        console.error('Error fetching monthly calorie data:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });


connectToDB(() => {
    app.listen(9000, () => {
        console.log("server running at 9000");
    })
})
})
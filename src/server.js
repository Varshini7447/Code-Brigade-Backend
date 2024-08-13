// import http from 'http'

// const port = 3000;

// const server = http.createServer((req, res) => {
//     if (req.url === '/myself'){
//     res.statusCode = 200
//     res.setHeader("Content-Type", "text/plain");
//     res.write("My team name is AST team\n")
//     res.write("what are you doing\n")
//     res.end()
//     }

//     else if (req.url === '/html') {
//         res.statusCode = 200
//         res.setHeader("Content-Type", "text/html");
//         res.write("my name is teja\n")
//         res.write("<h1>Hello darlings....</h1>")
//         res.end()
//     }

//     else if (req.method === 'GET' && req.url === '/recivedata') {
//         res.statusCode = 200
//         res.setHeader("Content-Type", "application/json");
//         let body = "";
//         req.on("data", (chunk) => {
//             body += chunk.toString();
//         });
//         console.log(body)
//         res.end()
//     } 

//     else if (req.url === '/senddata') {
//         res.statusCode = 200
//         res.setHeader("Content-Type", "application/json");
//         const data = { Name: "Teja", Branch: "cse" }
//         res.end(JSON.stringify(data))
//     }

//     else {
//         res.statusCode = 400
//         res.end("Page Not Found\n")
//     }
// });

// server.listen(port, () => {
//     console.log(`Server running at ${port}` );
// });
import cors from 'cors';
import express from 'express';
import { connectToDB,db } from "./db.js";

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json("Hey vijaya your server is running successfully!....");
})
// app.get('/', async(req, res) => {
//     console.log("")
//     res.json("Hey vijaya your server is running successfully!....");
// })
// app.post('/', (req, res) => {
//     res.json("Hey vijaya your server is running successfully!....");
// })
// app.post('/insert', async(req, res) => {
//     await db.collection("ast").insertOne({Name:req.body.Name,Branch:req.body.Branch})
//     .then((result)=>{
//         res.json(result)
//     })
//     .catch((e)=>console.log(e))
// })


// app.post('/insertMany', async(req, res) => {
//     await db.collection("ast").insertMany(req.body)
//     .then((result)=>{
//         res.json(result)
//     })
//     .catch((e)=>console.log(e))
// })



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
app.post('/students',async(req,res)=>{
    await db.collection("ast").find().toArray()
    .then((result)=>{
        res.json(result)
    })
    .catch((e)=>console.log(e))
})


connectToDB(() => {
    app.listen(9000, () => {
        console.log("server running at 9000");
    })
})
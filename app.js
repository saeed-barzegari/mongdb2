// app.js
const express = require('express');
const bodyParser = require("body-parser");
const { connectToMongoDB, closeMongoDBConnection } = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Serve static assets from the public folder
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
    res.render('welcome');
});

app.get('/information-form', (req, res) => {
    res.render('information-form');
});

app.post('/submit-information', async (req, res) => {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('user');
        console.log(req.body)
        const result = await collection.insertOne({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          age: req.body.age
        });
    
        res.redirect('/database-report');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        closeMongoDBConnection();
    }
});

app.get('/database-report', async (req, res) => {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection("user");
    
        const data = await collection.find({}).toArray();
    
        res.render("database-report", { data });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        closeMongoDBConnection();
      }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
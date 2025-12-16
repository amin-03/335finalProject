const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");

const Dog = require("./Dog");
const addDogRouter = require("./addDog");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'css')));

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
   quiet: true,
});

const databaseName = "FinalProject"; //to my mongodb database name
const collectionName = "dogCollection";
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });


async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        console.log("MongoDB connected");

        const port = process.env.PORT || 2025;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error("Startup error:", err);
    }
}

startServer();


app.get("/", (req, res) => {
   res.render("index");
});

const addDog = require("./addDog");
app.use("/addDog", addDog);


app.get("/list", async (req, res) => {
   
    try {
        const breeds = await Dog.distinct("breedName");


        resultWithDesc = [];
        Promise.all(
            breeds.map(r => getDogData(r))
        ).then(resultWithDesc => {
            table = "";
        if (resultWithDesc.length == 0){
            table = "There are no dogs in the collection at the moment";
        } else {
            table = "<table><thead> <th>Dog Breed</th><th>Description</th></thead>";
            resultWithDesc.forEach(elem => table += `<tr> <td>${elem[0]}</td> <td>(${elem[1]})</td></tr>`);
            table+="</table>";
        }
        
        const variables = {
            table: table,
        };

        res.render("list", variables);
        });
        
    } catch (e) {
        console.error(e);
    } 
});

function getDogData(breed) {
    return fetch('https://dogapi.dog/api/v2/breeds')
        .then(r => r.json())
        .then(data => {
            
        const foundBreed = data.data.find(b => b.attributes.name == breed);
        const desc = foundBreed.attributes.description || 'No description'; 
        dog = [foundBreed.attributes.name, desc]
        return(dog);
    });

}

app.get("/clear", async (req, res) => {
    try {

        await Dog.deleteMany({});
        res.render("clear");
    } catch (e) {
        console.error(e);
    } 

});



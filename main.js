const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

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

app.get("/", (request, response) => {
   response.render("index");
});

const addDog = require("./addDog")(client, databaseName, collectionName);
app.use("/addDog", addDog);


app.get("/list", async (req, res) => {
   
    try {
        await client.connect();
        const collection = client.db(databaseName).collection(collectionName);
        
        /* Listing all dogs */
        const filter = {};
        cursor = collection.find(filter);
        result = await cursor.toArray(); 
        resultJustNames = [];
        result.forEach(r => resultJustNames.push(r.breedName));
        uniqueResult = resultJustNames.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        resultWithDesc = [];
        Promise.all(
            uniqueResult.map(r => getDogData(r))
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
        // res.send(`<h2>dog list read</h2> ${table}`);
        });
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
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
      await client.connect();
      
      const collection = client.db(databaseName).collection(collectionName);
      const result = await collection.drop();

      res.render("clear");
   } catch (e) {
      console.error(e);
   } finally {
      await client.close();
   }
});
const port = process.env.PORT || 2025;
app.listen(port, () => {
    console.log(`main URL http://localhost:${port}/`);

});


const express = require('express');



module.exports = (client, databaseName, collectionName) => {
    const router = express.Router();

    router.use((req, res, next)=> {
        next();
    }) ;

    router.get("/", (req, res) =>{
        res.render("addDog");
    });

    router.post("/confirmation", async (req, res) =>{
        try {
            await client.connect();
            const collection = client.db(databaseName).collection(collectionName);
            getBreed = req.body.dogBreed;

            const dogBreed = { breedName: getBreed};
            result = await collection.insertOne(dogBreed);
        
            const variables = {
                dogBreed: getBreed,
            };
            res.render("addDogConfirm", variables);
        } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
        
    });
    return router;
};



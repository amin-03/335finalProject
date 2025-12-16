const express = require('express');

const Dog = require("./Dog");


const router = express.Router();

router.use((req, res, next)=> {
    next();
}) ;

router.get("/", (req, res) =>{
    res.render("addDog");
});

router.post("/confirmation", async (req, res) =>{
    try {
            
        getBreed = req.body.dogBreed;

        const dog = new Dog({
                breedName: getBreed
        });
        await dog.save();

        res.render("addDogConfirm", {
            dogBreed: getBreed
        });
    } catch (e) {
        console.error(e);
    } 
        
});
module.exports = router;   




const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema({
    breedName: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model("Dog", dogSchema);
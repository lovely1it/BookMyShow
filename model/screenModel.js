const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    name: {
        type: String
    },
    noOfSeats: {
        type: Number,
        default: 50
    },
    screenId: String,
    theatreId: String
});


const Screen = mongoose.model('Screen', screenSchema);
module.exports = Screen;
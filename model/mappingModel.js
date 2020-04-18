const mongoose = require('mongoose');

const MappingSchema = new mongoose.Schema({
    //for invoice add price here
    theatreId: String,
    movieId: String,
    screenId: String,
    slot: [
        { startTime: String,
          endTime: String, 
          totalseat: { type: Number, default: 50},
           bookedSeats: { type: Number, default:0}
        }]
});


const Mapping = mongoose.model('Mapping', MappingSchema);
module.exports = Mapping;
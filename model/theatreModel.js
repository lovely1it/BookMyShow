const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, ' theatre name is required'],
        unique: true 
    },
    address: {
        type: String,
        required: [true, 'address is required']
    },
    theatreId: String
});


const Theatre = mongoose.model('Theatre', theatreSchema);
module.exports = Theatre;
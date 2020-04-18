const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, ' movie name is required'],
        unique: true
    },
    releaseDate: {
        type: String,
        required: [true, 'release date is required']
    },
    language: String,
    movieId: String
});


const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
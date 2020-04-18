const mongoose = require('mongoose');
const express = require('express');
const movieTheatreController = require('./controller/movieTheatreController');

const app = express();

app.use(express.json());

//1) adding movies
app.post('/movie', movieTheatreController.addMovie);

//2) adding Theatre
app.post('/theatre', movieTheatreController.addTheatre);

//3) assignment of movie in theatre
app.post('/assign', movieTheatreController.assignMovies);

//4) update slots of movie in theatre
app.post('/updateslots', movieTheatreController.updateMoviesSlots);

//5) book ticket API
app.post('/bookticket', movieTheatreController.bookMovieTicket );

//6) getting all booked seats and available seats for a movie in a theatre 
app.get('/bookedseatlist', movieTheatreController.getBooketAndAvailableSeats);

//7) getting all theatre searched by movie and vice versa 
app.get('/list/?:id', movieTheatreController.searchMovieAndTheatre);

//MONGODB CONNECTION TO NODEJS APP
mongoose.connect('mongodb://localhost:27017/bookMyShow-App', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() =>  console.log('DB connected successfully!'));

const port = 3000;
app.listen(port, ()=>{
    console.log( `App is listening at port ${port}..... `);
});
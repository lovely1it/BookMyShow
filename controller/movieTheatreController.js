const mongoose = require('mongoose');
var nodemailer = require('nodemailer');
const Movie = require('./../model/movieModel');
const Theatre = require('./../model/theatreModel');
const Screen = require('./../model/screenModel');
const Mapping = require('./../model/mappingModel');
const sendEmail = require('./../utils/send-email');

//fun to create unique ID for movie and theatre
function getId( key ){
    var date = new Date();
    return key + date.getTime();
};

//fun to create unique ID for screens in theatre
function getScreenId( key, count ){
    var date = new Date();
    return key + date.getTime() + count;
};

//1) adding movies
const addMovie =  async (req, res) =>{
    try{
    var newMovie = req.body;
    newMovie.movieId = getId('mov');
    const addedMovie = await Movie.create(newMovie);
    res.status(201).json({
    status: 'success',
    data: {
        message: 'new movie added successfully!',
        addedMovie
     }
    });
    }catch(err) {
        res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
  
};

//2) adding Theatre
const addTheatre = async (req, res) =>{
    try{
    var data = req.body;
    var tId = getId('The');
    data.theatre['theatreId'] = tId;
    // console.log(data, '----');
    var modifiedScreen =[];
    var count = 1;
     data.screen.map( (ele) => {
        ele["theatreId"] = tId;
        ele["screenId"] = getScreenId('Scr',count++ );
        modifiedScreen.push(ele);
    } );
    
    var theatre = data.theatre;
    const createdT = await Theatre.create(theatre);
    const createdS = await Screen.create(modifiedScreen);
    res.status(201).json({
    status: 'success',
    data: {
        message: 'Theatre and screen got added successfully!',
        createdT,
        createdS
    }
    });
    }catch(err) {
        res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
  
};

//3) assignment of movie in theatre
 const assignMovies = async (req, res) =>{
    try{
    const movieAssigned = await Mapping.insertMany(req.body);
    res.status(201).json({
    status: 'success',
    data: {
        message: 'Movie assigned successfully in theatre.',
        movieAssigned
    }
    });
    }catch(err) {
        res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
  
};

//4) update slots of movie in theatre
const updateMoviesSlots = async (req, res) =>{
    try{
       var {theatreId,movieId,screenId}=req.body;
    //    console.log(theatreId,movieId,screenId, 'id----');
          const assignedMovies = await Mapping.updateMany({theatreId:theatreId,screenId:screenId,movieId:movieId},{slot:req.body.slot});
            res.status(201).json({
            status: 'success',
            data: {
                message: 'movies slots got updated in theatre successfully!',
                // assignedMovies
            }
                });
            }catch(err) {
                res.status(400).json({
                    status: 'failed',
                    message: err.message
                });
            }
  
};

//5) book movie ticket
const bookMovieTicket = async (req, res) =>{
    try{
        var msg;
       var {theatreId,movieId,screenId,slotId,noOfSeat}=req.body;       
    // console.log(theatreId,movieId,screenId, 'id----')
       const mappingData = await Mapping.find({theatreId:theatreId,screenId:screenId,movieId:movieId});
        if(mappingData.length>0){
            var bookedseat=  mappingData[0].slot[slotId].bookedSeats
            var totalseat=  mappingData[0].slot[slotId].totalseat
            if( totalseat >= bookedseat+noOfSeat ){
                mappingData[0].slot[slotId].bookedSeats += noOfSeat;
                const bookedTickets = await Mapping.updateMany({theatreId:theatreId,screenId:screenId,movieId:movieId},{slot:mappingData[0].slot});
                msg="successfully booked tickets!";

                //after booking is done successfully now send email invoice
                /** To work this email Give Permission:--https://myaccount.google.com/lesssecureapps to user's account */
                sendEmail.transporter.sendMail(sendEmail.mailOptions , function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                
            }
            else {
           
               throw new Error('enough seats are not available!');
            }
        }
        else{
            throw new Error('No data found to update!');
        }

    res.status(200).json({
    status: 'success',
    data: {
        message:msg 
    }
    });
    }catch(err) {
        res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
  
};

//6) getting all booked seats and available seats for a movie in a theatre 
const getBooketAndAvailableSeats = async (req, res) =>{
    try{
        var {theatreId,movieId}=req.body;  
        const data = await Mapping.find({theatreId:theatreId,movieId:movieId});
        // console.log(data, '------>');
        var bookedSeat=0;
        var availableSeat=0;
        if(data){
            data.forEach( element => {
                // console.log(element, 'element of theatre');
                 element.slot.forEach((ele) => {
                     bookedSeat += ele.bookedSeats;
                     availableSeat += ( ele.totalseat - ele.bookedSeats );
                    //  console.log(ele, 'element of slot')
                 })
            });
            var theatreDetail = await Theatre.findOne({theatreId:theatreId});
            var movieDetail = await Movie.findOne({movieId:movieId});   
        }
        else{
            throw new Error('No theatre and movie found!');
        }
            

    res.status(200).json({
    status: 'success',
    data: {
        theatreName: theatreDetail.name,
        movieName: movieDetail.name,
        availableSeat: availableSeat,
        bookedSeat: bookedSeat
    }
        });
    }catch(err) {
        console.log(err, 'error');
        res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
  
};

//7) getting all theatre searched by movie and vice versa 
const searchMovieAndTheatre = async (req, res) =>{
    try{
        if(req.params.id[0] === 'm'){
            const data = await Mapping.find({movieId: req.params.id});
            if(data.length === 0){
                throw new Error('This movie is not being palyed in any theatre!');
            }
            var theatreList = [];
            theatreList.push(data[0].theatreId);
            data.forEach((item) => {
                if( theatreList.indexOf(item.theatreId) === -1 ){
                    theatreList.push(item.theatreId);
                }
            });
            var theatreListName = [];
            theatreList.forEach( async (ele) => {
                var value = await Theatre.findOne({theatreId:ele});
                theatreListName.push(value.name);
            });        
            var movieName =  await Movie.findOne({movieId: req.params.id});
            var moviePlayedInTheatres ={
                movieName:movieName.name,
                theatreListName:theatreListName
            }
        }
        else if(req.params.id[0] === 'T') {
            const data = await Mapping.find({theatreId: req.params.id});
            if(data.length === 0){
                throw new Error('No movie is getting played in this theatre!');
            }
            var movieList = [];
            movieList.push(data[0].movieId);
            data.forEach((item) => {
                if( movieList.indexOf(item.movieId) === -1){
                    movieList.push(item.movieId);
                }
            });
            var movieListName = [];
            movieList.forEach( async (ele) => {
                var value = await Movie.findOne({movieId:ele});
                movieListName.push(value.name);
            });
            
            var theatreName =  await Theatre.findOne({theatreId: req.params.id});
            var moviePlayedInTheatres ={
               theatreName: theatreName.name,
               movieListName: movieListName
            }
        }
        else{
            throw new Error('Invalid ID of movie or theatre!');
        }
        

    res.status(200).json({
    status: 'success',
    moviePlayedInTheatres

    });
    }catch(err) {
        res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
  
};

module.exports = {
    addMovie,
    addTheatre,
    assignMovies,
    updateMoviesSlots,
    bookMovieTicket,
    getBooketAndAvailableSeats,
    searchMovieAndTheatre
};
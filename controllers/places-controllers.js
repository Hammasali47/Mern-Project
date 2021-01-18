const HttpError = require('../models/http-error')
const mongoose = require('mongoose');
const fs = require('fs');
const {v4:uuid} = require('uuid');
const {validationResult} = require('express-validator');
const Place = require('../models/place');
const User = require('../models/user');
let Dummy = [
    {
        id: 'p1',
        titile:'Empire State Building',
        description: 'One of famous buildong',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St New York, NY 10001',
        creator: 'u1'
    }
];

const getPlaceById =async(req,res,next)=>{
    // console.log('Get request recieved in places');
    // res.json({message: 'It works'});

    const placeId =req.params.pid;
    let place

    try{
        place =await Place.findById(placeId);
        
    }catch(err){
        const error = new HttpError(
            'Could not find place by Id something went wrong',500
        );
        return next(error);
    }

    // const place = Dummy.find(p=>{
    //     return p.id===placeId
    // });
    if(!place){
     //return res.status(404).json({message:'Could not find a place for the provided id.'});
    //  const error =new Error('Could not find a palace for the provided id.');
    //  error.code =404;
     const error =new HttpError('Could not find a palace for the provided id.',404);
     return next(error);
    }
    res.json({place:place.toObject({getters: true})});
}

// alternatives
// functiongetPlaceById() {...}
// const getPlaceById =function(){.....}

const getPlacesByUserId =async(req,res,next)=>{
    const userId =req.params.uid;
    // const places = Dummy.find(u=>{
    //     return u.creator===userId
    // });

    // let places
    let userWithPlaces;
    try{
        userWithPlaces =await User.findById(userId).populate('places');
    }catch(err){
        
        const error = new HttpError(
            'Fetching places by provide user id has failed',
            500
        )
        return next(error);
    }
    
    if(!userWithPlaces || userWithPlaces.places.length === 0){
        // return res.status(404).json({message:'Could not find a place for the provided User id.'});
        // const error =new Error('Could not find a palace for the provided User id.');
        // error.code =404;
        return next(new HttpError('Could not find a places for the provided User id.',404));
     }

    res.json({places: userWithPlaces.places.map(place=> place.toObject({getters: true}))});
}

const updatePlaceByPlaceId = async(req,res,next)=>{
    const {title,description} = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid Input passed check your data',422));

    }
    const placeId =req.params.pid;
    let place
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError(
            'Something went wrong Could not update',
            500
        )
        return next(error)
    }
    
    if(place.creator.toString() !== req.userData.userId){
        const error = new HttpError(
            'You are not allow to edit this place',
            401
        );
        return next(error);
    }

    place.title=title;
    place.description=description;

    try{
       await place.save();
    }catch(err){
        const error = new HttpError(
            'Something went wrong Could not update place',
            500
        )
        return next(error);
    }
    

    res.status(201).json({place:place.toObject({getters:true})});
    
}

const deletePlaceByPlaceId = async(req,res,next)=>{
    const placeId =req.params.pid;
    let place
    try{
        place=await Place.findById(placeId).populate('creator');
    }catch(err){
        const error = new HttpError(
            'Could not delete place for provided place id',
            404
        )
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id.', 404);
        return next(error);
      }

      if(place.creator.id !== req.userData.userId){
          const error = new HttpError(
              'You are not allow to delete this place',
              401
          )
          return next(error);
      }
    
      const imagePath = place.image;
    
      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not delete place.',
          500
        );
        return next(error);
      }
    
      fs.unlink(imagePath, err => {
        console.log(err);
      });
    
      res.status(200).json({ message: 'Deleted place.' });
}

const createPlace =async(req,res,next)=>{
    const {title,description,address}=req.body;
    
    const cordinates = await {lat:4554,lng:989}

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors);
        throw new HttpError('Invalid Input passed check your data',422);

    }

    const createdPlace = new Place({
        title,
        description,
        address, 
        location: cordinates,
        image:req.file.path,
        creator:req.userData.userId
    })
    // Dummy.push(createPlace);

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError(
            'Creating place failed please try again',
             500
        );
        return next(error);
    }

    if(!user){
        const error =new HttpError(
            'Could not find user for provided id',
            404
        )
        return next(error);
    }

    console.log(user);

    try{

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session:sess});

        user.places.push(createdPlace);
        await user.save({session:sess});
        await sess.commitTransaction();
        
    }catch(err){
        console.log(err.message);
        const error = new HttpError(
            'Creating Place failed try again',
            500
        );
        return next(error);
    }
    
    res.status(201).json({place:createdPlace})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId =getPlacesByUserId;
exports.createPlace= createPlace;
exports.updatePlaceByPlaceId =updatePlaceByPlaceId;
exports.deletePlaceByPlaceId = deletePlaceByPlaceId;
 const express =require('express');
 const fs = require('fs');
 const path = require('path');
 const bodyParser =require('body-parser');
 const HttpError = require('./models/http-error')
 const mongoose = require('mongoose');
 require('dotenv').config();
 const placesRoutes = require('./routes/places-routes');
 const usersRoutes = require('./routes/user-routes');
 const app = express();

 app.use(bodyParser.json());

 app.use('/uploads/images',express.static(path.join('uploads','images')));
 app.use('/uploads/placesImage',express.static(path.join('uploads','placesImage')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
    next();
  });
  

 app.use('/api/places',placesRoutes);
 app.use('/api/users',usersRoutes);



 app.use((req,res,next)=>{
     const error = new HttpError("Could not find this route",404);
     throw error;
 })

 app.use((error,req,res,next)=>{

    if(req.file){
        fs.unlink(req.file.path,(err)=>{
            console.log(err);
        });
    }

     if(res.headerSent){
         return next(error);
     }
     res.status(error.code || 500);
     res.json({message:error.message || 'An unknown error has occured'});
 });

 mongoose.connect(
    //  'mongodb+srv://hammasali47:03215181367@cluster0.c30fs.mongodb.net/mern?retryWrites=true&w=majority'
     `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c30fs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
 )
 .then(()=>{
     console.log('db connected')
    app.listen(process.env.PORT || 5000);
 })
 .catch(err=>{
     console.log(err);
 })

//  if (process.env.NodeENV === 'production'){
//      app.use(express.static('client/build'));
//  }

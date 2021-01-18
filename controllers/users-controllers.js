const HttpError = require('../models/http-error');
const {v4:uuid} = require('uuid');
const { createPlace } = require('./places-controllers');
const {validationResult} =require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const Dummy_User = [
//     {
//         id:'u1',
//         name : 'Max',
//         email : 'max@max.com',
//         password : 'maxi'
//     }
// ]


const getUser = async(req,res,next)=>{
    let exsistingUser
    try {
        exsistingUser =await User.find({},'-password');
    } catch (err) {
        const error = new HttpError(
            'Could not retive data from database',
            500
        )
        return next(error);
    }
    res.json({exsistingUser:exsistingUser.map(user => user.toObject({getters:true}))})
};

const signup = async(req,res,next)=>{
    const {name, email, password} =req.body;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
     return next(new HttpError('Invalid Inputs',422))
     
    }

    let exsistingUser

    try {
        exsistingUser  =await User.findOne({email:email});
    }catch (err) {
        const error = new HttpError(
            'Signinup failed,please try again',
            500
        )
        return next(error);
        }

    if(exsistingUser){
        const error = new HttpError(
            'User exsisting already, please login instead',
            422
        )
        return next(error);
    }

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password,12);
    } catch (err) {
        const error = new HttpError(
            'Could not create user, please try again',
            500
            );
            return next(error);
    }

    const createdUser =new User({
        name,
        email,
        image:req.file.path,
        password:hashedPassword,
        places:[]
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signingup failed,please try again',
            500
        );
        return next(error);
    }

    let token;
    
    try {
       
        token = jwt.sign(
            {userId: createdUser.id, email:createdUser.email},
            process.env.JWT_KEY,
            {expiresIn: '1h'}
        );
    } catch (err) {
        const error = new HttpError(
            'Signingup failed,please try again',
            500
        );
        return next(error);
    }
    
    res
    .status(201)
    .json({userId:createdUser.id,email:createdUser.email,token:token});
};

const login = async(req,res,next)=>{
    const {email,password} = req.body;

    let exsistingUser

    try {
        exsistingUser  =await User.findOne({email:email});
    }catch (err) {
        const error = new HttpError(
            'Logging in failed,please try again',
            500
        )
        return next(error);
        }

        if(!exsistingUser)
        {
            const error = new HttpError(
                'Invalid credentials,could not log you in',
                401
            )
            return next(error);
        }

        let isValidPassword = false;

        try {
            isValidPassword = await bcrypt.compare(password,exsistingUser.password);
        } catch (err) {
            const error = new HttpError(
                'Could not log you in, please check your credentials and try again',
                500
            );
            return next(error);
        }

        if(!isValidPassword){
            const error = new HttpError(
                'Invalid credentials,could not log you in',
                403
            )
            return next(error);
        }

        let token 
        try {
            token= jwt.sign(
                {userId:exsistingUser.id,email:exsistingUser.email},
                process.env.JWT_KEY,
                {expiresIn:'1h'}
            )
        } catch (err) {
            const error = new HttpError(
                'Logging in failed,please try again',
                500
            );
            return next(error);
        }
 
    res.json({
   message:'Loogged in!',
   userId:exsistingUser.id,
   email:exsistingUser.email,
   token:token
});
};


exports.getUser = getUser;
exports.login = login;
exports.signup = signup;
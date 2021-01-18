const express = require('express');
const { check} = require('express-validator')

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../Middleware/file-upload');
const checkAuth = require('../Middleware/check-auth');

const router = express.Router();

router.get('/:pid',placesControllers.getPlaceById);

router.get('/user/:uid',placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.patch('/:pid', 
[
    check('title')
.not()
.isEmpty(),

check('description')
.isLength({min: 5}),
]
,placesControllers.updatePlaceByPlaceId);

router.delete('/:pid',placesControllers.deletePlaceByPlaceId);

router.post('/',
fileUpload.single('image'),
[
    check('title')
.not()
.isEmpty(),

check('description')
.isLength({min: 5}),

check('address')
.not()
.isEmpty()
],

placesControllers.createPlace)

module.exports =router;
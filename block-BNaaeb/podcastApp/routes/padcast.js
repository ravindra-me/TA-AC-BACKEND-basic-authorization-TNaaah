var express = require('express');
var router =  express.Router();
var auth = require('../middleware/auth');
var upload =require('../utils/multer');
var userMedia = require('../models/UserMedia');
var Media = require('../models/Media');
const User = require('../models/User');

router.use(auth.userInfo);

router.get('/', (req,res, next)=> {
    console.log("hi")
    let {category, userId} = req.user;

    if(req.user.isAdmin){
        Media.find({} , (err , podcast)=> {
            if(err) return next(err);
            Media.distinct('types' , (err, categoryes)=>{
                if(err) return next(err);
               return res.render('podcastList' , {categoryes , podcast})
            })
        })
    } 
    if(category === 'free') {
        Media.find({types : category} , (err , podcast)=> {
            if(err) return next(err);
            Media.distinct('types' , (err, categoryes)=>{
                if(err) return next(err);
               return res.render('podcastList' , {categoryes , podcast})
            })
        })
    }else if(category === 'vip') {
        Media.find({types :{$in : ['free' , 'vip']} } , (err , podcast)=> {
            if(err) return next(err);
            Media.distinct('types' , (err, categoryes)=>{
                if(err) return next(err);
                console.log(categoryes);
               return res.render('podcastList' , {categoryes , podcast})
            })
        })
    }else{
        Media.find({} , (err , podcast)=> {
            if(err) return next(err);
            Media.distinct('types' , (err, categoryes)=>{
                if(err) return next(err);
               return res.render('podcastList' , {categoryes , podcast})
            })
        })
    } 
})

router.get('/new', (req, res, next)=> {
    res.render('newPadcast');
})

router.post('/new' ,upload.single('file'),(req, res, next)=> {
    req.body.file = req.file.filename;
    req.body.userId = req.user._id;
    console.log(req.body, req.file);
    if(req.user.isAdmin) {
        Media.create(req.body , (err , content)=> {
            if(err) return next(err);
            res.redirect('/');
        })
    }else{
        userMedia.create(req.body, (err, content)=>{
            if(err) return next(err);
            res.redirect('/');
        })
    }
})


router.use(auth.adminUser)


router.get('/dashboard', (req, res, next)=> {
    console.log("dashboard")
    Media.find({}, (err, podcast)=> {
        if(err) return next(err);
        Media.distinct('types' , (err, categoryes)=>{
            if(err) return next(err);
            console.log(categoryes);
            User.find({isAdmin:false}, (err , users)=> {
                if(err) return next(err);
                return res.render('dashboard' , {categoryes , podcast, users})
            })
        })
    })
})


module.exports = router;
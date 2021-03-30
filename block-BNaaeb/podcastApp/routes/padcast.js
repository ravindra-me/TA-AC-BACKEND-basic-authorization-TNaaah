var express = require('express');
var router =  express.Router();
var auth = require('../middleware/auth');
var upload =require('../utils/multer');
var userMedia = require('../models/UserMedia');
var Media = require('../models/Media');
const User = require('../models/User');

router.use(auth.userInfo);

router.get('/', (req,res, next)=> {
    let {category, userId} = req.user;
    if(req.user.isAdmin){
        Media.find({} , (err , podcast)=> {
            if(err) return next(err);
            console.log("admin");
            Media.distinct('types' , (err, categoryes)=>{
                if(err) return next(err);
               return res.render('podcastList' , {categoryes , podcast})
            })
        })
    }else if(category === 'free') {
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
    }else if(category === "premium"){
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

router.get('/usermedia', (req, res, next)=>{
    userMedia.find({}, (err, podcast)=> {
        if(err) return next(err);
        Media.distinct('types' , (err, categoryes)=>{
            if(err) return next(err);
            console.log(categoryes);
            User.find({isAdmin:false}, (err , users)=> {
                if(err) return next(err);
                return res.render('userMedia' , {categoryes , podcast, users})
            })
        })
    })
})

router.get('/:id/accept', (req, res, next)=> {
    userMedia.findById(req.params.id, (err, podcast)=> {
        if(err) return next(err)
        if(!podcast.isAccept) {
            let obj = {};
            obj.title = podcast.title;
            obj.types = podcast.types;
            obj.file = podcast.file;
            obj.userId = podcast.userId
            Media.create(obj, (err , content)=> {
                if(err) return next(err);
                podcast.isAccept = true;
                podcast.save((err, updatePoscast)=> {
                    if(err) return next(err);
                  return  res.redirect('/podcast/usermedia')
                })
            })
        }else{
            podcast.isAccept = true;
            podcast.save((err, updatePoscast)=> {
                if(err) return next(err);
              return  res.redirect('/podcast/usermedia')
            })
        }
    })
})


router.get('/:id/reject', (req, res, next)=> {
    userMedia.findByIdAndDelete(req.params.id, (err, podcast)=> {
        if(err) return next(err);
        res.redirect('/podcast/userMedia');
    })
})

router.get("/:id/userblock", (req, res, next) => {
    User.findById(req.params.id, (err, content) => {
      if (err) return next(err);
      if (content.isBlock) {
        content.isBlock = false;
        content.save((err, update) => {
          if (err) return next(err);
          res.redirect("/podcast/dashboard");
        });
      } else {
        content.isBlock = true;
        content.save((err, update) => {
          if (err) return next(err);
          res.redirect("/podcast/dashboard");
        });
      }
    });
  });

router.get('/:elem/category', (req, res, next)=> {
    Media.find({types: req.params.elem}, (err, podcast)=> {
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
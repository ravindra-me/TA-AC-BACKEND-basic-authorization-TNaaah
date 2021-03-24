var express = require("express");

var router = express.Router();
var Items = require("../models/Items");
const multer = require("multer");
var path = require("path");
const { mkdir } = require("fs");
var auth = require("../middleaware/auth");
var Users = require("../models/Users");

// console.log(path.join(__dirname))
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, '..' , '/public/images/products'));
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname + '-' + Date.now())
//     }
// })

// var upload = multer({storage:storage});

router.get('/' , (req, res, next)=> {
    Items.find({},(err , items)=> {
        if(err) return next(err)
        Items.distinct('catagories', (err , catagories)=> {
            if(err) return next(err)
            console.log({data:items , catagories: catagories})
            // res.render('item' ,{data:items , catagories: catagories})
        })
    })
})


router.use(auth.loggedInUser);

router.use(auth.adminUser);

router.get("/new", (req, res, next) => {
  res.render("addItems");
});

router.post("/additem", (req, res, next) => {
  // req.body.productImage = req.file.originalname;
  console.log(req.body);
  req.body.adminId = req.session.userId;
  Items.create(req.body, (err, content) => {
    if (err) next(err);
    console.log(content)
    Users.findByIdAndUpdate(
      req.session.userId,
      { $push: { itemId: content._id } },
      { new: true },
      (err, content) => {
          if(err) return next(err);
          res.redirect('/items');
      }
    );
  });
});

module.exports = router;

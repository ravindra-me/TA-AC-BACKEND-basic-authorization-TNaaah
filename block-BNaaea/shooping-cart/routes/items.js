var express = require("express");

var router = express.Router();
var Items = require("../models/Items");
const multer = require("multer");
var path = require("path");
const { mkdir } = require("fs");
var auth = require("../middleaware/auth");
var Users = require("../models/Users");
var Comments = require("../models/Comments");
var Cart = require("../models/Cart");

console.log(path.join(__dirname));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "/public/images/products"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });

router.get("/", (req, res, next) => {
  Items.find({}, (err, items) => {
    if (err) return next(err);
    Items.distinct("catagories", (err, catagories) => {
      if (err) return next(err);
      res.render("listOfItems", { data: items, catagories: catagories });
    });
  });
});

router.use(auth.loggedInUser);

router.get("/:id/detail", (req, res, next) => {
  Items.findById(req.params.id)
    .populate("commentId")
    .exec((err, item) => {
      if (err) next(err);
      res.render("singleItem", { data: item });
    });
});

router.get("/:id/likes", (req, res, next) => {
  let id = req.session.userId;
  Items.findOne({ _id: req.params.id, likes: { $in: id } }, (err, content) => {
    if (err) return next(err);
    let isAlreadyAdded = {
      $pull: { likes: id },
    };

    if (!content) {
      isAlreadyAdded = {
        $push: { likes: id },
      };
    }

    Items.findOneAndUpdate(
      { _id: req.params.id },
      isAlreadyAdded,
      { new: true },
      (err, updateContent) => {
        if (err) return next(err);
        res.redirect("/items/" + updateContent._id + "/detail");
      }
    );
  });
});

router.post("/:id/comment", (req, res, next) => {
  req.body.userId = req.user._id;
  req.body.itemId = req.params.id;
  console.log(req.body);
  Comments.create(req.body, (err, content) => {
    if (err) return next(err);
    Items.findByIdAndUpdate(
      req.params.id,
      { $push: { commentId: content._id } },
      { new: true },
      (err, updateContent) => {
        if (err) next(err);
        res.redirect("/items/" + updateContent._id + "/detail");
      }
    );
  });
});

router.get("/:id/cart", (req, res, next) => {
  let id = req.params.id;
  Cart.findOneAndUpdate(
    { userId: req.user._id, "listItems.itemId": id },
    { $inc: { "listItems.$.quantityProduct": 1 } },
    (err, result) => {
      // if result -> null, could not find item so add new item
      if(result) {
        return res.redirect("/items/" + id + "/detail");
      }
      if (!result) {
        Cart.findOneAndUpdate(
          { userId: req.user._id },
          { $push: { listItems: { itemId: id } } },
          (err, cart) => {
            return  res.redirect("/items/" + id + "/detail");
          }
        );
      }
      // if result -> cart object, item was there and quantity has been updated
    }
  );
});


router.get('/:e/catagories' , (req, res, next)=> {
  console.log("cat")
  Items.find({catagories : req.params.e}, (err , content)=>{
    if (err) return next(err);
    Items.distinct("catagories", (err, catagories) => {
      if (err) return next(err);
      res.render("listOfItems", { data: content, catagories: catagories });
    });
  })
})

router.use(auth.adminUser);

router.get("/new", (req, res, next) => {
  res.render("addItems");
});

router.post("/new", upload.single("productImage"), (req, res, next) => {
  req.body.productImage = req.file.filename;
  req.body.catagories = req.body.catagories.toLowerCase();
  // console.log(req.body);
  req.body.adminId = req.session.userId;
  Items.create(req.body, (err, content) => {
    if (err) next(err);
    console.log(content);
    Users.findByIdAndUpdate(
      req.session.userId,
      { $push: { itemId: content._id } },
      { new: true },
      (err, content) => {
        if (err) return next(err);
        res.redirect("/items");
      }
    );
  });
});

// router.use(auth.itemInfo);

router.get("/:id/edit", (req, res, next) => {
  Items.findById(req.params.id, (err, content) => {
    if (err) next(err);
    res.render("editItem", { data: content });
  });
});

router.post("/:id/edit", (req, res, next) => {
  console.log("edit");
  Items.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, content) => {
      if (err) next(err);
      res.redirect("/items/" + content._id + "/detail");
    }
  );
});

router.get("/:id/delete", (req, res, next) => {
  let id = req.params.id;
  Items.findByIdAndDelete(req.params.id, (err, content) => {
    if (err) return next(err);
    Comments.deleteMany({ itemId: id }, (err, deleteContent) => {
      if (err) next(err);
      res.redirect("/items");
    });
  });
});

router.get("/dashboard", (req, res, next) => {
  Users.find({ isAdmin: false }, (err, users) => {
    if (err) next(err);
    Items.find({}, (err, items) => {
      if (err) next(err);
      res.render("dashboard", { users, items });
    });
  });
});

router.get("/:id/user", (req, res, next) => {
  Users.findById(req.params.id, (err, content) => {
    if (err) return next(err);
    if (content.isBlock) {
      content.isBlock = false;
      content.save((err, update) => {
        if (err) return next(err);
        res.redirect("/items/dashboard");
      });
    } else {
      content.isBlock = true;
      content.save((err, update) => {
        if (err) return next(err);
        res.redirect("/items/dashboard");
      });
    }
  });
});

module.exports = router;

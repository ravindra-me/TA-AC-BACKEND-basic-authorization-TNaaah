var express = require("express");
const { get } = require("./users");
var router = express.Router();
var auth = require("../middleaware/auth");
var Cart = require("../models/Cart");

router.use(auth.loggedInUser);

router.get("/", (req, res, next) => {
  Cart.findOne({ userId: req.user._id })
    .populate("listItems.itemId")
    .exec((err, content) => {
      if (err) next(err);

      res.render("cart", { data: content, error: req.flash("error") });
    });
});

router.get("/:id/inc", (req, res, next) => {
  var id = req.params.id;
  console.log(id)
  var userId = req.user._id;
//   Cart.findOneAndUpdate(
//     { userId: userId, "listItems._id": id },
//     { $inc: { "listItems.$.quantityProduct": 1 } },
//     (err, content) => {
//       if (err) return next(err);
//       console.log(err);
//       res.redirect("/cart");
//     }
//   );
    Cart.findOne({ userId: userId })
        .populate('listItems.itemId')
        .exec((err, cart) => {
        if(err) return next(err)
        var currentItem = cart.listItems.filter(l => l._id.toString() === id)[0]
       if(currentItem.quantityProduct < currentItem.itemId.quantityOfProduct) {
          cart.listItems =  cart.listItems.map(l => {
               if(l._id === currentItem._id) {
                 l.quantityProduct +=1
                 return l;
               }else{
                   return l;
               }
           })
           cart.save((err ,  updatecon)=>{
               res.redirect('/cart');
           })
           
       }else{
           req.flash("error" , "You can not add items above this quantity")
           res.redirect('/cart');
       }
    })
});

router.get("/:id/dec", (req, res, next) => {
    var id = req.params.id;
    console.log(id)
    var userId = req.user._id;
    Cart.findOneAndUpdate(
      { userId: userId, "listItems._id": id },
      { $inc: { "listItems.$.quantityProduct": -1 } },
      (err, content) => {
        if (err) return next(err);
        res.redirect("/cart");
      }
    );
});

router.get("/:id/remove", (req, res, next) => {
    var id = req.params.id;
    console.log(id)
    var userId = req.user._id;
    Cart.findOneAndUpdate(
      { userId: userId},
      { $pull: { listItems: {_id: id} } },
      (err, content) => {
        if (err) return next(err);
        res.redirect("/cart");
      }
    );
});



module.exports = router;

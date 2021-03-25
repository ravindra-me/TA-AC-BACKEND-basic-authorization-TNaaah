var express = require("express");
var router = express.Router();
var Comments = require("../models/Comments");
const Items = require("../models/Items");
var auth = require("../middleaware/auth");

router.get("/:id/commentlike", (req, res, next) => {
    var id  = req.session.userId;
   Comments.findById(req.params.id, (err, content)=> {
       if(content.likes.includes(id)) {
           content.likes.pull(id);
           content.save((err, updateContent)=> {
               if(err) return next(err);
               res.redirect('/items/'+updateContent.itemId+'/detail')
           })
       }else{
        content.likes.push(id);
        content.save((err, updateContent)=> {
            if(err) return next(err)
            res.redirect('/items/'+updateContent.itemId+'/detail')
        })
       }
   })
});

router.get("/:id/commentedit", auth.CommentInfo, (req, res, next) => {
  Comments.findById(req.params.id, (err, content) => {
    if (err) return next(err);
    res.render("editComment", { data: content });
  });
});

router.post("/:id/commentedit", (req, res, next) => {
  Comments.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, updateContent) => {
      if (err) return next(err);
      res.redirect("/items/" + updateContent.itemId._id + "/detail");
    }
  );
});

router.get("/:id/commentdelete", auth.CommentInfo, (req, res, next) => {
  Comments.findById(req.params.id, (err, content) => {
    if (err) return next(err);
    Items.findByIdAndUpdate(
      content.itemId,
      { $pull: { commentId: content._id } },
      (err, updateConvent) => {
        if (err) return next(err);
        res.redirect("/items/" + updateConvent._id+ '/detail');
      }
    );
  });
});
module.exports = router;

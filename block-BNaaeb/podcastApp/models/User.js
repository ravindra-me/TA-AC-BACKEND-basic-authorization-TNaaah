var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var user = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 5, required: true },
    isAdmin: { type: Boolean, default: false, required: false },
    podcastId:[{type:Schema.Types.ObjectId , ref:'Media'}],
    category: {
        type:String,
        default:'free',
        enum : ['free', 'vip' , 'premium']
    },
    isBlock: {type:Boolean, default:false},
  },
  { timestamps: true }
);

user.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) next(err);
      this.password = hashed;
      return next();
    });
  } else {
    next();
  }
});

user.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model("User", user);
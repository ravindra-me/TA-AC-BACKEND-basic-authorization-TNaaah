var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var comment = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    title: { type: String, required: true },
    name: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    itemId: {type:Schema.Types.ObjectId, ref:"Items"},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comments', comment);

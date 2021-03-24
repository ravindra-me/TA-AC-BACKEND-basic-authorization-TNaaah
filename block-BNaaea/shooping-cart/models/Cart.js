var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var cart = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    listItems: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
        quantityProduct: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cart);

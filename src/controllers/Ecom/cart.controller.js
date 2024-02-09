import { cart} from "../../models/Ecom/cart.js";
import { products } from "../../models/Ecom/product.js";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import mongoose from "mongoose";


export const getCart = async (userId) => {

    const cartAggregation = await cart.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $project: {
          // _id: 0,
          product: { $first: "$product" },
          quantity: "$items.quantity",
          coupon: 1, // also project coupon field
        },
      },
      {
        $lookup: {
          // lookup for the coupon
          from: "coupons",
          localField: "coupon",
          foreignField: "_id",
          as: "coupon",  //Previous coupon shall be overwritten by the result- now it's an array due to lookup.
        },
      },
      {
        $group: {
          _id: "$_id",
          items: {
            $push: "$$ROOT",
          },
          coupon: { $first: "$coupon" },// get first value of coupon after grouping //will return null if no coupon.
          cartTotal: {
            $sum: {
              $multiply: ["$product.price", "$quantity"], // calculate the cart total based on product price * total quantity
            },
          },
        },
      },
      // {
      //   $addFields: {
      //     // As lookup returns an array we access the first item in the lookup array
      //     coupon: { $first: "$coupon" },
      //   },
      // },
      {
        $addFields: {
          discountedTotal: {
            // Final total is the total we get once user applies any coupon
            // final total is total cart value - coupon's discount value
            $cond:{
              if:{ $and:[
                {$ne:[{$type:'$coupon'}, undefined]},
                {$ne:[{$type:'$coupon'}, null]},
                {$gte:['$cartTotal', '$coupon.discount']}
              ]
              },
              then:{
                $subtract: ["$cartTotal", "$coupon.discount"],
              },
              else: "$cartTotal"
            },
            
          },
        },
      },
    ]);
  
    return (
      cartAggregation[0] ?? {
        _id: null,
        items: [],
        cartTotal: 0,
        discountedTotal: 0,
      }
    );
  };
  
const getUserCart = asyncHandler(async (req, res) => {
    const cart = await getCart(req.user?._id);
  
    console.log(cart)
    return res.status(200).json(new apiResponse(200, 'cart fetched successfully', cart))
});
  
const addItemOrUpdateItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
  
    if(!productId) throw new apiError('To make this http request please provide the productId', 422)
    
    if(! mongoose.Types.ObjectId.isValid(productId)) throw new apiError('Not a valid Id', 400);

    // fetch user cart
    const foundCart = await cart.findOne({
      owner: req.user._id,
    });
  
    // See if product that user is adding exist in the db
    const product = await products.findById(productId);
  
    if (!product) {
      throw new apiError(404, "Product does not exist");
    }
  
    // If product is there check if the quantity that user is adding is less than or equal to the product's stock
    if (quantity > product.stock) {
      // if quantity is greater throw an error
      throw new apiError(
        400,
        product.stock > 0
          ? "Only " +
            product.stock +
            " products are remaining. But you are adding " +
            quantity
          : "Product is out of stock"
      );
    }
  
    // See if the product that user is adding already exists in the cart
    const addedProduct = foundCart.items?.find(
      (item) => item.product.toString() === productId
    );
  
    if (addedProduct) {
      // If product already exist assign a new quantity to it
      // ! We are not adding or subtracting quantity to keep it dynamic. Frontend will send us updated quantity here
      addedProduct.quantity = quantity;
      // if user updates the cart remove the coupon associated with the cart to avoid misuse
      // Do this only if quantity changes because if user adds a new product the cart total will increase anyways
      if (foundCart.coupon) {
        foundCart.coupon = null;
      }
    } else {
      // if its a new product being added in the cart push it to the cart items
      foundCart.items.push({
        productId,
        quantity,
      });
    }
  
    // Finally save the cart
    await cart.save({ validateBeforeSave: true });
  
    const newCart = await getCart(req.user._id); // structure the user cart
  
    return res
      .status(200)
      .json(new apiResponse(200, "Item added successfully",newCart));
  });
  
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId = ""} = req.params;
  
    if(!productId) throw new apiError('To make this http request please provide the productId', 422)
    
    if(! mongoose.Types.ObjectId.isValid(productId)) throw new apiError('Not a valid Id', 400);
    
    const product = await products.findById(productId);
  
    // check for product existence
    if (!product) {
      throw new apiError("Product does not exist", 404);
    }


    const updatedCart = await cart.findOneAndUpdate(
      {
        owner: req.user?._id,
      },
      {
        // Pull the product inside the cart items
        // ! We are not handling decrement logic here that's we are doing in addItemOrUpdateItemQuantity method
        // ! this controller is responsible to remove the cart item entirely
        $pull: {
          items: {
            product: productId,
          },
        },
      },
      { new: true }
    );
  
    let foundCart = await getCart(req.user._id);
  
    // check if the cart's new total is greater than the minimum cart total requirement of the coupon
    if (foundCart.coupon && foundCart.cartTotal < foundCart.coupon.minimumCartValue) {
      // if it is less than minimum cart value remove the coupon code which is applied
      updatedCart.coupon = null;
      await updatedCart.save({ validateBeforeSave: false });
      // fetch the latest updated cart
      foundCart = await getCart(req.user._id);
    }
  
    return res
      .status(200)
      .json(new apiResponse(200, "Cart item removed successfully", foundCart));
  });
  
const clearCart = asyncHandler(async (req, res) => {
    await cart.findOneAndUpdate(
      {
        owner: req.user?._id,
      },
      {
        $set: {
          items: [],
          coupon: null,
        },
      },
      { new: true }
    );
    const foundCart = await getCart(req.user._id);
  
    return res
      .status(200)
      .json(new apiResponse(200, "Cart has been cleared", foundCart));
  });
  
  
export {
  getUserCart,
  addItemOrUpdateItemQuantity,
  removeItemFromCart,
  clearCart,
};
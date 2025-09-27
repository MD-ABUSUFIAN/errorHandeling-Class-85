require('dotenv').config();
const { customError } = require('../helpers/customError');
// const varientModel = require('../models/varient.Model');
const productModel = require('../models/products.Model');
const { asyncHandeler } = require('../utils/asyncHandeler');
const {
  uploadCloudinaryFile,
  deleteCloudinaryFile,
} = require('../helpers/cloudinary');
const { apiResponse } = require('../utils/apiResponse');
const { validateReview } = require('../validation/cutomerReview.validation');

// create customer review

exports.createReview = asyncHandeler(async (req, res) => {
  const data = await validateReview(req);


 
  // upload image into cloudinary
  const imageUrl = await Promise.all(
    data.images.map( (img) =>uploadCloudinaryFile(img.path))
  );
//    console.log(imageUrl);

  // now save into database
  const submitReview = await productModel.findByIdAndUpdate(
    { _id: data.productId },

    {
      $push: {
        reviews: {
          ...data,
          image: imageUrl,
        },
      },
    },
    {new: true}

  );
  if (!submitReview) {
    throw new customError(500, 'Review submission created failed, try again');

  }
   apiResponse.sendSucess(res, 200,'Review submission created successfully', submitReview);
});

// delete review 
exports.deleteReview = asyncHandeler(async (req, res) => {
  const{ reviewerid, productId} = req.body;
//   find the product 
    const product = await productModel.findById(productId);
    if(!product){
        throw new customError(404, 'Product not found');
    }
    // find the review
    const reviewMatch = product.reviews.find(reviewItem => reviewItem.
reviewerid.toString() === reviewerid.toString());
    if (!reviewMatch) {
        throw new customError(404, 'Review not found');
    }

    // delete the review
    product.reviews.pull(reviewMatch._id);
    await product.save();

   apiResponse.sendSucess(res, 200,'Review deleted successfully');
})

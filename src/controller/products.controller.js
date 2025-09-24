const { NONAME } = require('node:dns/promises');
const {
  uploadCloudinaryFile,
  deleteCloudinaryFile,
} = require('../helpers/cloudinary');
require('dotenv').config();
const { customError } = require('../helpers/customError');
const { generateQRCode, generateBarCode } = require('../helpers/qrCode');
const productsModel = require('../models/products.Model');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandeler } = require('../utils/asyncHandeler');
const { validateProduct } = require('../validation/products.validation');

exports.createProducts = asyncHandeler(async (req, res) => {
  //   const barCode = await generateBarCode('hello');
  const data = await validateProduct(req);
  const allImages = [];
  // upload images for cloudinary

  for (const img of req.files.image) {
    const imageInfo = await uploadCloudinaryFile(img.path);
    allImages.push(imageInfo);
  }

  // NOW SAVE PRODUCT INTO DATABASE
  const product = await productsModel.create({
    ...data,
    image: allImages,
  });
  if (!product) throw new customError('Product create failed, try again');
  // create QR code for the product
  const link = `${process.env.FRONTEND_URL}/products/` + product.slug;
  const barCodeText = data.qrCode
    ? data.qrCode
    : `${product.sku}-${product.name.slice(0, 3)}-${new Date().getFullYear()}`;
  const qrcode = await generateQRCode(link);
  if (data.qrCode) {
    product.qrCode = data.qrCode;
    await product.save();
  }
  const barcode = await generateBarCode(barCodeText);
  //    now update product with qr code and bar code
  product.qrCode = qrcode;
  product.barCode = barcode;
  if (
    !data.retailPrice &&
    !data.purchasePrice &&
    !data.wholeSalePrice &&
    !data.color
  ) {
    product.variantType = 'multiple';
  } else {
    product.variantType = 'single';
  }
  await product.save();

  //    create bar code for the product

  apiResponse.sendSucess(res, 200, 'Product created sucessfully', product);
});

// get all data with pagination
exports.getAllProducts = asyncHandeler(async (req, res) => {
  const {sortBy}=req.query;
  const sortCriteria = {};
  if(sortBy=='created-descending'){
    sortCriteria={createdAt:-1};
  }
  else if(sortBy=='created-ascending'){
    sortCriteria={createdAt:1};
  }
  else if(sortBy=='name-descending'){
    sortCriteria={name:-1};
  }
  else if(sortBy=='name-ascending'){
    sortCriteria={name:1};
  }
  else{
    sortCriteria={createdAt:-1};
  }
  const findProducts = await productsModel
    .find()
    .sort( sortCriteria  )
    .populate({
      path: 'category',
      select: '-subCategory -createdAt -updatedAt -__v',
    })
    .populate({ path: '-subCategory' })
    .populate({ path: 'brand' });
  if (!findProducts) throw new customError('No products found', 404);
  apiResponse.sendSucess(res, 200, 'All products data', findProducts);
  console.log(findData);
});

//  get a single product
exports.getSingleProduct = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, 'slug not found');
  const singleProduct = await productsModel
    .findOne({ slug: slug })
    .populate({
      path: 'category',
      select: '-subCategory -createdAt -updatedAt -__v',
    })
    .populate({ path: '-subCategory' })
    .populate({ path: 'brand' });
  if (!singleProduct) throw new customError(401, 'single product not found');
  console.log(singleProduct);
  apiResponse.sendSucess(
    res,
    201,
    'single data find out successfully',
    singleProduct
  );
});

// update a products information

exports.updateProduct = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  console.log(req.body);
  if (!slug) throw new customError(404, 'product slug not found');
  const product = await productsModel.findOneAndUpdate(
    { slug: slug },
    req.body,
    { new: true }
  );
  if (!product) throw new customError(404, 'product not found');
  apiResponse.sendSucess(res, 201, 'product fetch successfully done', product);
});

// update product image
exports.updateProductImage = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) throw new customError(404, 'product slug not found');
  const product = await productsModel.findOne({ slug: slug });

  for (const imageId of req.body.imageId) {
    await deleteCloudinaryFile(imageId);
    product.image = product.image.filter((img) => img.publicId !== imageId);
  }
  // upload image for cloudinary

  for (const image of req.files.image) {
    const imageInfo = await uploadCloudinaryFile(image.path);
    product.image.push(imageInfo);
  }
  await product.save();

  apiResponse.sendSucess(res, 201, 'product fetch successfully done', product);
});

// get product by category id sub category id and brand id

exports.getProduct = asyncHandeler(async (req, res) => {
  const { category, subCategory, brand, tag } = req.query;
  let query;
  if (category) {
    query = { ...query, category: category };
  }
  if (subCategory) {
    query = { ...query, subCategory: subCategory };
  }
  if (brand) {
    if (Array.isArray(brand)) {
      query = { ...query, brand: { $in: brand } };
    } else {
      query = { ...query, brand: brand };
    }
  }
  if (tag) {
    if (Array.isArray(tag)) {
      query = { ...query, tag: { $in: tag } };
    } else {
      query = { ...query, tag: tag };
    }
  }

  // if(name){query={name:{$regex:name,$options:"i"}}}
  const product = await productsModel.find(query);
  if (!product) {
    throw new customError(404, 'no product found');
  }
  apiResponse.sendSucess(res, 200, 'Products felter successfully', product);
});

// get product by price filter

exports.priceFilterProduct = asyncHandeler(async (req, res) => {
  const { minPrice, maxPrice } = req.query;
  if (!minPrice || !maxPrice) {
    throw new customError(404, 'Min and Max price are required');
  }
  const product = await productsModel.find({
    $and: [{ retailPrice: { $gte: minPrice, $lte: maxPrice } }],
  });

  if (!product) {
    throw new customError(404, 'no products found');
  }
  apiResponse.sendSucess(res, 200, 'products fetch successfully', product);
});

// get product $lase than price filter ($lte)


// product pagination 
exports.productPagination = asyncHandeler(async(req,res)=>{
  const {page,item}=req.query;
  const skipAmount=(page-1)*item || 0;
  const totalItems=await productsModel.countDocuments();
  const totalPage=Math.ceil(totalItems/item);
  const findProducts = await productsModel
    .find()
    .limit(item)
    .skip(skipAmount)
    .populate({
      path: 'category',
      select: '-subCategory -createdAt -updatedAt -__v',
    })
    .populate({ path: '-subCategory' })
    .populate({ path: 'brand' });
  if (!findProducts) throw new customError('No products found', 404);
  apiResponse.sendSucess(res, 200, 'All products data pagination', {
    findProducts,
    totalItems,
    totalPage,
  });


  // let {page,limit}=req.query;
  // page=page || 1;
  // limit=limit || 10;

  // const skip=(page-1)*limit;
  // const products=await productsModel.find().skip(skip).limit(limit);
  // const totalProducts=await productsModel.countDocuments();

  // apiResponse.sendSucess(res,200,'Products fetched successfully',{
  //   products,
  //   totalPages:Math.ceil(totalProducts/limit),
  //   currentPage:page
  // });
});
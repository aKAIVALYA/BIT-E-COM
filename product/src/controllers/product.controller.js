const productModel = require("../models/product.model");
const Product = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }

    const seller = req.user.id;

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    // Upload images and add to array
    const images = [];
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await Promise.all(
        req.files.map((file) => uploadImage({ buffer: file.buffer }))
      );
      uploadedFiles.forEach((img) => {
        images.push({
          url: img.url,
          thumbnail: img.thumbnailUrl,
          id: img.id,
        });
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      seller,
      images,
    });
    return res
      .status(201)
      .json({ message: "Product created successfully", data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getProducts(req, res) {
  const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

  const filter = {};

  if (q) {
    filter.$text = { $search: q };
  }

  if (minprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $gte: Number(minprice),
    };
  }

  if (maxprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $lte: Number(maxprice),
    };
  }

  const products = await productModel
    .find(filter)
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 20));

  return res.status(200).json({ data: products });
}

async function getProductById(req, res) {
  const { id } = req.params;

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json({ product: product });
}

async function updateProduct(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = await productModel.findOne({ _id: id, seller: req.user.id });

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found or unauthorized" });
  }

  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Unauthorized to update this product" });
  }

  const allowedUpdates = ["title", "description", "price"];
  for (const key of Object.keys(req.body)) {
    if (allowedUpdates.includes(key)) {
      if (key === "price" && typeof req.body[key] === "object") {
        if (req.body[key].amount !== undefined) {
          product.price.amount = Number(req.body[key].amount);
        }
        if (req.body[key].currency) {
          product.price.currency = req.body[key].currency;
        } else {
          product.price.currency = "INR";
        }
      }
    }
    await product.save();
    return res.status(200).json({ message: "Product updated", product });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findOne({
    _id: id,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only delete your own products" });
  }

  await productModel.findOneAndDelete({ _id: id });
  return res.status(200).json({ message: "Product deleted" });
}

async function getProductsBySeller(req, res) {
  const seller = req.user;

  const { skip = 0, limit = 20 } = req.query;

  const products = await productModel
    .find({ seller: seller.id })
    .skip(skip)
    .limit(Math.min(limit, 20));

  return res.status(200).json({ data: products });
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};

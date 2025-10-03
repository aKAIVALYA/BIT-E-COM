const express = require("express");
const multer = require("multer");
const productController = require("../controllers/product.controller");
const { createAuthMiddleware } = require("../middlewares/auth.middleware");
const { createProductValidators } = require("../validators/product.validators");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidators,
  productController.createProduct
);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.patch( "/:id",createAuthMiddleware(["seller" ]), productController.updateProduct );
router.delete( "/:id",createAuthMiddleware(["seller" ]), productController.deleteProduct );

router.get( "/seller/me", createAuthMiddleware(["seller"]), productController.getProductsBySeller );

module.exports = router;

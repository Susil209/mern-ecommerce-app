const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductsById,
  updateProduct,
} = require("../controller/Product");
const router = express.Router();

router
  .post("/", createProduct)
  .get("/", getAllProducts)
  .get("/:id", getProductsById).patch("/:id", updateProduct)

exports.router = router;

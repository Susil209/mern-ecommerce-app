const { Product } = require("../model/Product");

exports.createProduct = async (req, res) => {
  // this comes from api calling
  const newProduct = req.body;

  //connect to db
  const product = new Product(newProduct);
  product.discountPrice = Math.round(
    product.price * (1 - product.discountPercentage / 100)
  );
  await product
    .save()
    .then((item) => {
      res.status(201).json(item);
    })
    .catch((e) => {
      res.status(400).json(e);
    });
};

exports.getAllProducts = async (req, res) => {
  //filter = {"category" : ["smartphone","laptops"] }
  // sort = {_sort : "price", _order: "desc"}
  // pagination = {_page: 1 , _limit=10}
  let conditionToShowNoProduct = {};
  if (!req.query.admin) {
    conditionToShowNoProduct.deleted = { $ne: true };
  }

  let query = Product.find(conditionToShowNoProduct);
  let totalProductsQuery = Product.find(conditionToShowNoProduct);
  if (req.query.category) {
    query = query.find({ category: { $in: req.query.category.split(",") } });
    totalProductsQuery = totalProductsQuery.find({
      category: { $in: req.query.category.split(",") },
    });
  }
  if (req.query.brand) {
    query = query.find({ brand: { $in: req.query.brand.split(",") } });
    totalProductsQuery = totalProductsQuery.find({
      brand: { $in: req.query.brand.split(",") },
    });
  }
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }
  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;

    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  const totalCount = await totalProductsQuery.count().exec();
  console.log(totalCount);

  await query
    .exec()
    .then((products) => {
      res.set("X-Total-Count", totalCount); //to set header
      res.status(200).json(products);
    })
    .catch((e) => {
      res.status(404).json(e);
    });
};

exports.getProductsById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json(error);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    product.discountPrice = Math.round(
      product.price * (1 - product.discountPercentage / 100)
    );
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
};

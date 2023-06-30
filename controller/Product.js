const { Product } = require("../model/Product")

exports.createProduct = async (req,res) => {
    // this comes from api calling
    const newProduct = req.body;

    //connect to db
    const product = new Product(newProduct);
    await product.save()
    .then((item)=>{
      res.status(201).json(item);
    })
    .catch((e)=>{
      res.status(400).json(e);
    })
}

exports.getAllProducts = async (req, res) => {
     //filter = {"category" : ["smartphone","laptops"] }
    // sort = {_sort : "price", _order: "desc"}
    // pagination = {_page: 1 , _limit=10}
    let conditionToShowNoProduct = {};
    if(!req.query.admin){
      conditionToShowNoProduct.deleted = {$ne:true};
    }

    let query = Product.find(conditionToShowNoProduct);
    let totalProductsQuery = Product.find(conditionToShowNoProduct);
    if(req.query.category){
        query = query.find({category: req.query.category});
        totalProductsQuery = totalProductsQuery.find({
          category: req.query.category,
        });
    }
    if(req.query.brand){
        query = query.find({brand:req.query.brand});
        totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand });
    }
    if(req.query._sort && req.query._order){
        query = query.sort({[req.query._sort] : req.query._order});
    }
    if(req.query._page && req.query._limit){
        const pageSize = req.query._limit;
        const page = req.query._page;

        query = query.skip(pageSize*(page-1)).limit(pageSize);
    }

    const totalCount = await totalProductsQuery.count().exec();
    console.log(totalCount);

     await query.exec()
      .then((products)=>{
        res.set('X-Total-Count',totalCount); //to set header
         res.status(200).json(products);
      }) 
      .catch((e)=>{
        res.status(404).json(e);
      })
}

exports.getProductsById = async (req, res) => {
  const {id} = req.params;
  
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json(error);
  }
  
}


exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const updateProduct = req.body;
  await Product.findByIdAndUpdate(productId,updateProduct,{new: true})
      .then((updatedItem)=>{
        res.status(200).json(updatedItem);
      })
      .catch((e)=>{
        res.status(404).json(e);
      })
 
  }
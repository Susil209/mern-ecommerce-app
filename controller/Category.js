
const { Category } = require("../model/Category");

exports.fetchAllCategories = async (req,res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(404).json(error);
    }
}

exports.createCategory = async (req,res) => {
    // this comes from api calling
    const newCategory = req.body;

    //connect to db
    const category = new Category(newCategory);
    await category.save()
    .then((item)=>{
      res.status(201).json(item);
    })
    .catch((e)=>{
      res.status(400).json(e);
    })
}
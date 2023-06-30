const { Brand } = require("../model/Brand")

exports.fetchAllBrands = async (req,res) => {
    try {
        const brands = await Brand.find({});
        res.status(200).json(brands);
    } catch (error) {
        res.status(404).json(error);
    }
}

exports.createBrand = async (req,res) => {
    // this comes from api calling
    const newBrand = req.body;

    //connect to db
    const brand = new Brand(newBrand);
    await brand.save()
    .then((item)=>{
      res.status(201).json(item);
    })
    .catch((e)=>{
      res.status(400).json(e);
    })
}
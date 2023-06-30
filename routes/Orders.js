const express = require('express');
const { createOrder, fetchOrdersByUser, deleteOrder, updateOrder, getAllOrders } = require('../controller/Order');

const router = express.Router();
//  /orders is already added in base path
router.post('/', createOrder)
      .get('/myUser/', fetchOrdersByUser)
      .delete('/:id', deleteOrder)
      .patch('/:id', updateOrder)
      .get('/', getAllOrders)


exports.router = router;
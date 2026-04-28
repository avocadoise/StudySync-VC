const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid ID format', 400));
  }
  next();
};

module.exports = validateObjectId;

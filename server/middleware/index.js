module.exports = {
  ...require('./errorMiddleware'),
  ...require('./authMiddleware'),
  ...require('./validationMiddleware'),
};

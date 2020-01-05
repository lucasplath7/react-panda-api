const sendSuccess = (res, message) => data => {
  res.statusMessage = message;
  res.status(200).json(data);
}

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    next(err);
  });
};

module.exports = {
  sendSuccess,
  asyncMiddleware,
}
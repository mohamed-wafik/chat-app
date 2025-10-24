export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      return res.status(500).json({
        message: err.message,
        status: 500,
        data: null,
      });
    });
  };
};

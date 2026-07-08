/**
 * A wrapper to eliminate the need for try/catch blocks in every controller.
 * It catches any errors thrown in an async route handler and passes them to the global error handler.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;

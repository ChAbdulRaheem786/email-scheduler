// Express 4 does not forward rejected promises from async route handlers to
// next(err) automatically — an unhandled rejection can crash the whole process
// on modern Node. Wrapping every async handler in this ensures errors always
// reach the central error-handling middleware instead.
export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

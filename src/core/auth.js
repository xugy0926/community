export const userRequired = function (req) {
  if (!req.user) {
    throw new Error('You are not authorized');
  }
}

export const adminRequired = function (req) {
  if (!req.user) {
    throw new Error('You are not authorized');
  }

  if (!req.user.isAdmin()) {
    throw new Error('You are not a admin');
  }
}

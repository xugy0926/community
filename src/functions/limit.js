export function onlyMe(req) {
  return function (id1) {
    return function (id2) {
      if ((id2.toString() !== id1.toString()) && !req.session.user.isAdmin) {
        throw new Error('no limit.');
      }
    }
  }
}

export function withoutMe(req) {
  return function (id1) {
    return function (id2) {
      if ((id2.toString() === id1.toString()) && !req.session.user.isAdmin) {
        throw new Error('no limit.');
      }
    }
  }
}
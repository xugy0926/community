export default ids => {
  return {
    _id: {
      $in: ids
    }
  };
};

exports.index = function(req, res) {
  res.render('index', { userCount: numOfUsers });
};

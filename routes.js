exports.index = function(req, res) {
  res.render('index', { users: numOfUsers, topic: currTopic });
};

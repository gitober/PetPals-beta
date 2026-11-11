// Only lets a logged-in user change their own account.
// Use after requireAuth on routes with a :username parameter.
const requireSelf = (req, res, next) => {
  if (!req.user || req.user.username !== req.params.username) {
    return res.status(403).json({ error: "You can only change your own account" });
  }
  next();
};

module.exports = requireSelf;

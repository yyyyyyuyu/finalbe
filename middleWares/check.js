var verify = require('../utils/utils').decode;



module.exports = {
  checkToken: function (req, res, next) {
    let token = req.query.token || req.body.token || req.get('token');
    verify(token, (err, decoded) => {
      if (err) {
        return res.status(401)
          .json({ error: 'token无效，请重新登录' });
      } else {
        next();
      }
    })
  }
};

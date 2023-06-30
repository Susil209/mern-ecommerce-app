const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");

const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  // this comes from api calling
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    "sha256",
    async function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      const user = new User({ ...req.body, password: hashedPassword, salt });
      //connect to db
      await user
        .save()
        .then((item) => {
          req.login(sanitizeUser(item), function (err) {
            if (err) {
              return res.status(400).json(err);
            }
          });
          const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
          res
            .cookie("jwt", token, {
              expires: new Date(Date.now() + 3600000),
              httpOnly: true,
            })
            .status(201)
            .json( { id: user.id, role: user.role });
        })
        .catch((e) => {
          res.status(400).json(e);
        });
    }
  );
};

exports.loginUser = async (req, res) => {
  res
    .cookie("jwt", req.user.token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    })
    .status(201)
    .json(req.user.token);
  // res.json(req.user);
};

exports.checkAuth = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
};

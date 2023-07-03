const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser, sendMail } = require("../services/common");

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
          const token = jwt.sign(
            sanitizeUser(user),
            process.env.JWT_SECRET_KEY
          );
          res
            .cookie("jwt", token, {
              expires: new Date(Date.now() + 3600000),
              httpOnly: true,
            })
            .status(201)
            .json({ id: user.id, role: user.role });
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

exports.logout = async (req,res) => {
  res
    .cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .sendStatus(200)
}

exports.checkAuth = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
};

exports.resetPasswordRequest = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });

  if (user) {
    const token = crypto.randomBytes(48).toString("hex");
    user.resetPasswordToken = token;
    await user.save();
    // Also set token in email
    const resetPageLink =
      'http://localhost:3000/reset-password?token=' + token + '&email=' + email;
    const subject = "reset password for e-commerce";
    const html = `<p>Click <a href='${resetPageLink}'>here</a> to Reset Password</p>`;
    if (email) {
      const response = await sendMail({ to: email, subject, html });
      res.json(response);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
};


exports.resetPassword = async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email: email, resetPasswordToken: token });
  if (user) {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      'sha256',
      async function (err, hashedPassword) {
        user.password = hashedPassword;
        user.salt = salt;
        await user.save();

        const loginPage = 'http://localhost:3000/login';
        const subject = 'Password successfully reset for e-commerce';
        const html = `<p>Your password is reset successfully.To go back to login page click <a href='${loginPage}'>here</a>.</p>`;
        if (email) {
          const response = await sendMail({ to: email, subject, html });
          res.json(response);
        } else {
          res.sendStatus(400);
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
};



const db = require("../sqlconnection");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");
const request = db.promise();

const register = async (req, res, next) => {
  try {
    const { email, username, password, repassword } = req.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send({
        message: "format email tidak benar",
      });
    }
    if (password !== repassword) {
      return res.status(400).send({
        message: "password tidak cocok",
      });
    }
    if (password.length <= 5) {
      return res.status(400).send({
        message: "password minimal 6 digit",
      });
    }
    const cekEmail = await request.query(
      `SELECT * FROM user WHERE email='${email}'`
    );
    if (cekEmail[0].length !== 0) {
      return res.status(400).send({
        message: "email sudah terdaftar",
      });
    }
    const cekUsername = await request.query(
      `SELECT * FROM user WHERE username='${username}'`
    );
    if (cekUsername[0].length !== 0) {
      return res.status(400).send({
        message: "username tersebut sudah ada",
      });
    }
    const data = {
      id: v4(),
      username: username,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    await request.query(
      `INSERT INTO user (id, email, username, password) VALUES ('${data.id}', '${data.email}', '${data.username}', '${data.password}')`
    );
    res.status(200).send({
      message: "register berhasil",
      //   data: data,
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const cekUsername = await request.query(
      `SELECT * FROM user WHERE username='${username}'`
    );
    if (cekUsername[0].length === 0) {
      return res.status(400).send({
        message: "username tidak terdaftar",
      });
    }
    const cekPassword = await bcrypt.compare(
      password,
      cekUsername[0][0].password
    );
    if (!cekPassword) {
      return res.status(400).send({
        message: "password tidak valid",
      });
    }
    res.status(200).send({
      message: "login berhasil",
      data: cekUsername[0][0],
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
};

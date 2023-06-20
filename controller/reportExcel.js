const db = require("../sqlconnection");
const { v4 } = require("uuid");
const request = db.promise();

const get = async (req, res, next) => {
  try {
    // const query = req.query;
    // const limit = query.limit ? Number(query.limit) : 50;
    // const offset = query.offset ? Number(query.offset) : 1;
    const data = await request.query(`SELECT * FROM report_production_ng`);
    // const total = await request.query(
    //   `SELECT COUNT(report_production_ok_id) as total FROM report_production_ok`
    // );
    res.status(200).send({
      message: "success",
      data: data[0],
      // offset: offset,
      // limit: limit,
      // total: total[0][0].total,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  get,
};

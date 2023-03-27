const db = require("../sqlconnection");
const { v4 } = require("uuid");
const request = db.promise();

const create = async (req, res, next) => {
  try {
    const { nama_defect } = req.body;
    const count = await request.query(
      `SELECT COUNT(nama_defect) as count FROM m_defect`
    );
    await request.query(
      `INSERT INTO m_defect (m_defect_id, nama_defect, kode_defect, is_active) VALUES ('${v4()}', '${nama_defect}', '${
        count[0][0].count + 1
      }', 'Y')`
    );
    res.status(200).send({
      message: "input defect berhasil",
    });
  } catch (err) {
    return next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const query = req.query;
    const limit = query.limit ? Number(query.limit) : 50;
    const offset = query.offset ? Number(query.offset) : 1;
    const data = await request.query(
      `SELECT * FROM m_defect WHERE is_active = 'Y' ORDER BY ${query.sortby} ${query.sorting} LIMIT ${limit} OFFSET ${offset}`
    );
    const total = await request.query(
      `SELECT COUNT(nama_defect) as total FROM m_defect`
    );
    res.status(200).send({
      message: "success",
      data: data[0],
      offset: offset,
      limit: limit,
      total: total[0][0].total,
    });
  } catch (err) {
    return next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    await request.query(
      `UPDATE m_defect SET is_active = 'N' WHERE m_defect_id = '${id}'`
    );
    res.status(200).send({
      message: "hapus defect berhasil",
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  get,
  destroy,
};

const db = require("../sqlconnection");
const { v4 } = require("uuid");
const request = db.promise();

const create = async (req, res, next) => {
  try {
    const { part_name } = req.body;
    const count = await request.query(
      `SELECT COUNT(part_name) as count FROM m_barang`
    );
    await request.query(
      `INSERT INTO m_barang (m_barang_id, part_name, part_number, is_active) VALUES ('${v4()}', '${part_name}', '${
        count[0][0].count + 1
      }', 'Y')`
    );
    res.status(200).send({
      message: "input barang berhasil",
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
      `SELECT * FROM m_barang WHERE is_active = 'Y' ORDER BY ${query.sortby} ${query.sorting} LIMIT ${limit} OFFSET ${offset}`
    );
    const total = await request.query(
      `SELECT COUNT(part_name) as total FROM m_barang`
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
      `UPDATE m_barang SET is_active = 'N' WHERE m_barang_id = '${id}'`
    );
    res.status(200).send({
      message: "delete barang berhasil",
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

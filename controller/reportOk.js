const db = require("../sqlconnection");
const { v4 } = require("uuid");
const request = db.promise();
const moment = require("moment");

const create = async (req, res, next) => {
  try {
    const {
      box,
      lot,
      man_power,
      ok_qty,
      m_barang_id,
      // part_name, part_no,
      shift,
    } = req.body;
    const mBarang = await request.query(
      `SELECT * FROM m_barang WHERE m_barang_id = '${m_barang_id}'`
    );
    if (!mBarang[0].length) {
      return res.status(400).send({
        message: "barang tidak ditemukan",
      });
    }
    const sql = `INSERT INTO report_production_ok (report_production_ok_id, box, lot, man_power, ok_qty, part_name, part_no, shift) VALUES ('${v4()}', '${box}', '${lot}', '${man_power}', '${ok_qty}', '${
      mBarang[0][0].part_name
    }', '${mBarang[0][0].part_number}', '${shift}')`;
    const sql2 = `INSERT INTO report_excel (report_excel_id, part_no, part_name, lot, shift, box_no, ok_qty, ng_qty, black_dot, contamination, dirty, flash, white_mark, broken, bulan, tahun) VALUES ('${v4()}','${
      mBarang[0][0].part_number
    }', '${
      mBarang[0][0].part_name
    }', '${lot}', '${shift}', '${box}', '${ok_qty}', '0', '0', '0', '0', '0', '0', '0', '${moment().format(
      "MM"
    )}', '${moment().format("YYYY")}')`;
    await request.query(sql);
    await request.query(sql2);
    res.status(200).send({
      message: "input report ok berhasil",
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
      `SELECT * FROM report_production_ok ORDER BY ${query.sortby} ${query.sorting} LIMIT ${limit} OFFSET ${offset}`
    );
    const total = await request.query(
      `SELECT COUNT(report_production_ok_id) as total FROM report_production_ok`
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
      `DELETE FROM report_production_ok WHERE report_production_ok_id = '${id}'`
    );
    res.status(200).send({
      message: "hapus report ok berhasil",
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

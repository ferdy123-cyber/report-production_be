const db = require("../sqlconnection");
const { v4 } = require("uuid");
const moment = require("moment/moment");
const request = db.promise();
var json2xls = require("json2xls");
const fs = require("fs");
const shelljs = require("shelljs");
const path = require("path");

const create = async (req, res, next) => {
  try {
    const { box, lot, ng_qty, m_barang_id, m_defect_id } = req.body;
    const mBarang = await request.query(
      `SELECT * FROM m_barang WHERE m_barang_id = '${m_barang_id}'`
    );
    if (!mBarang[0].length) {
      return res.status(400).send({
        message: "barang tidak ditemukan",
      });
    }
    const mDefect = await request.query(
      `SELECT * FROM m_defect WHERE m_defect_id = '${m_defect_id}'`
    );
    if (!mDefect[0].length) {
      return res.status(400).send({
        message: "defect tidak ditemukan",
      });
    }
    const sql = `INSERT INTO report_production_ng (report_production_ng_id, box, lot, ng_qty, part_name, part_no, kode_defect, nama_defect, bulan, tahun) 
    VALUES ('${v4()}', '${box}', '${lot}', '${ng_qty}', '${
      mBarang[0][0].part_name
    }', '${mBarang[0][0].part_number}', '${mDefect[0][0].kode_defect}', '${
      mDefect[0][0].nama_defect
    }', '${moment().format("MM")}', '${moment().format("YYYY")}')`;
    const sql2 = `INSERT INTO report_excel (report_excel_id, part_no, part_name, lot, shift, box_no, ok_qty, ng_qty, black_dot, contamination, dirty, flash, white_mark, broken, bulan, tahun) VALUES ('${v4()}','${
      mBarang[0][0].part_number
    }', '${
      mBarang[0][0].part_name
    }', '${lot}', 'null', '${box}', '0', '${ng_qty}', '${
      mDefect[0][0].nama_defect == "Black Dot" ? ng_qty : 0
    }', '${mDefect[0][0].nama_defect == "Contamination" ? ng_qty : 0}', '${
      mDefect[0][0].nama_defect == "Dirty" ? ng_qty : 0
    }', '${mDefect[0][0].nama_defect == "Flash" ? ng_qty : 0}', '${
      mDefect[0][0].nama_defect == "White Mark" ? ng_qty : 0
    }', '${
      mDefect[0][0].nama_defect == "Broken" ? ng_qty : 0
    }', '${moment().format("MM")}', '${moment().format("YYYY")}')`;
    await request.query(sql);
    await request.query(sql2);
    res.status(200).send({
      message: "input report ng berhasil",
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
    if (!query.tanggal) {
      return res.status(400).send({
        message: "tanggal harus diisi",
      });
    }
    const bulan = moment(query.tanggal).format("MM");
    const tahun = moment(query.tanggal).format("YYYY");
    // console.log(bulan, tahun);
    const data = await request.query(
      `SELECT * FROM report_production_ng WHERE bulan = '${bulan}' AND tahun = '${tahun}' ORDER BY ${query.sortby} ${query.sorting} LIMIT ${limit} OFFSET ${offset}`
    );
    const total = await request.query(
      `SELECT COUNT(report_production_ng_id) as total FROM report_production_ng`
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
      `DELETE FROM report_production_ng WHERE report_production_ng_id = '${id}'`
    );
    res.status(200).send({
      message: "hapus report ng berhasil",
    });
  } catch (err) {
    return next(err);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const root = path.join(__dirname, "..");
    const filesRepo = "FilesRepo";
    const body = req.body;
    const bulan = moment(body.tanggal).format("MM");
    const tahun = moment(body.tanggal).format("YYYY");
    const dataNg = await request.query(
      `SELECT * FROM report_production_ng WHERE bulan = '${bulan}' AND tahun = '${tahun}' ORDER BY tanggal ASC`
    );
    const dataOk = await request.query(
      `SELECT * FROM report_production_ok ORDER BY tanggal ASC`
    );
    console.log(dataOk[0]);
    shelljs.mkdir("-p", filesRepo);
    var xls = json2xls(dataNg[0]);
    const uploadPath = `${filesRepo}/report${tahun}-${bulan}.xlsx`;
    // uploadedFile.mv
    // console.log(dataNg[0]);
    fs.writeFileSync(`./${uploadPath}`, xls, "binary");
    const selectedPath = `${root}/${uploadPath}`;
    const resolvedPath = selectedPath.replace(/\\/g, "/");
    res.sendFile(resolvedPath);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  get,
  destroy,
  exportExcel,
};

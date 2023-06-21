const db = require("../sqlconnection");
const { v4 } = require("uuid");
const request = db.promise();
const moment = require("moment");
const json2xls = require("json2xls");
const fs = require("fs");
const path = require("path");

const get = async (req, res, next) => {
  try {
    const query = req.query;
    if (!query.tanggal) {
      return res.status(400).send({
        message: "tanggal harus diisi",
      });
    }
    const bulan = moment(query.tanggal).format("MM");
    const tahun = moment(query.tanggal).format("YYYY");
    const data = await request.query(
      `SELECT *, SUM(ng_qty) as ng_qty, SUM(ok_qty) as ok_qty, SUM(black_dot) as black_dot, SUM(contamination) as contamination, SUM(dirty) as dirty, SUM(flash) as flash, SUM(white_mark) as white_mark, SUM(broken) as broken FROM report_excel WHERE bulan = '${bulan}' AND tahun = '${tahun}' GROUP BY lot, part_no ORDER BY lot ASC`
    );
    const array = data[0].map((e) => ({
      ...e,
      total: Number(e.ng_qty) + Number(e.ok_qty),
      rasio: `${(
        (Number(e.ng_qty) / (Number(e.ng_qty) + Number(e.ok_qty))) *
        100
      ).toFixed(0)}%`,
    }));
    res.status(200).send({
      message: "success",
      data: array,
    });
  } catch (err) {
    return next(err);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const rootPath = path.join(__dirname, "../");
    const query = req.query;
    if (!query.tanggal) {
      return res.status(400).send({
        message: "tanggal harus diisi",
      });
    }
    const bulan = moment(query.tanggal).format("MM");
    const tahun = moment(query.tanggal).format("YYYY");
    const data = await request.query(
      `SELECT *, SUM(ng_qty) as ng_qty, SUM(ok_qty) as ok_qty, SUM(black_dot) as black_dot, SUM(contamination) as contamination, SUM(dirty) as dirty, SUM(flash) as flash, SUM(white_mark) as white_mark, SUM(broken) as broken FROM report_excel WHERE bulan = '${bulan}' AND tahun = '${tahun}' GROUP BY lot, part_no ORDER BY lot ASC`
    );
    const array = data[0].map((e) => ({
      ...e,
      total: Number(e.ng_qty) + Number(e.ok_qty),
      rasio: `${(
        (Number(e.ng_qty) / (Number(e.ng_qty) + Number(e.ok_qty))) *
        100
      ).toFixed(0)}%`,
      tanggal: moment(e.tanggal).format("DD/MM/YYYY"),
    }));
    if (!Array.isArray(array)) {
      res.status(400).send({
        message: "data harus array",
      });
    }
    const json = array.map((obj) => {
      const newObj = { ...obj }; // Membuat salinan objek agar objek asli tidak terpengaruh
      ["report_excel_id", "bulan", "tahun"].forEach(
        (key) => delete newObj[key]
      ); // Menghapus kunci yang ditentukan dari objek
      return newObj;
      // const { ["report_excel_id"]: deletedKey, ok: deletedKey, ...rest } = e;
      // return rest;
    });
    var xls = json2xls(json);
    const name = `report-${String(Date.now())}.xlsx`;
    fs.writeFileSync(`tmp/${name}`, xls, "binary");
    res.sendFile(rootPath + `tmp/${name}`);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  get,
  exportExcel,
};

const Datastore = require("nedb");
var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000
var path = require("path");
const { Z_ASCII } = require("zlib");
var hbs = require("express-handlebars");

app.use(express.static("static"));

app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine(
  "hbs",
  hbs({
    extname: ".hbs",
    defaultLayout: "main.hbs",
    partialsDir: "views/partials",
    helpers: {
      ifEditing: function (dane) {
        for (let i = 0; i < Object.keys(dane).length; i++) {
          if (dane[i].edit == true) {
            return "<h3>Wszystkie pojazdy - edycja: </h3>";
          }
        }
        return "<h3>Wszystkie pojazdy: </h3>";
      },
    },
  })
); // domyślny layout, potem można go zmienić
app.set("view engine", "hbs");

const coll2 = new Datastore({
  filename: "kolekcja2.db",
  autoload: true,
});

app.get("/", function (req, res) {
  res.render("index.hbs");
});

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/handleForm", function (req, res) {
  var wpis = {
    ubezpieczony: req.query.ubezpieczony == "on" ? "TAK" : "NIE",
    benzyna: req.query.benzyna == "on" ? "TAK" : "NIE",
    uszkodzony: req.query.uszkodzony == "on" ? "TAK" : "NIE",
    naped4x4: req.query.naped4x4 == "on" ? "TAK" : "NIE",
    edit: false,
  };
  coll2.insert(wpis, function (err, aaa) {});
  coll2.find({}, function (err, docs) {
    res.render("index2.hbs", { dane: docs });
  });
});

app.get("/delete", function (req, res) {
  coll2.remove({ _id: req.query.idd }, { multi: true });
  coll2.find({}, function (err, docs) {
    res.render("index2.hbs", { dane: docs });
  });
});

app.get("/edit", function (req, res) {
  coll2.find({}, function (err, docs) {
    for (let i = 0; i < docs.length; i++) {
      docs[i].edit = false;
      coll2.update(
        { _id: docs[i]._id },
        { $set: docs[i] },
        {},
        function (err, numReplaced) {}
      );
    }
    coll2.findOne({ _id: req.query.id }, function (err, doc) {
      doc.edit = true;
      coll2.update(
        { _id: req.query.id },
        { $set: doc },
        {},
        function (err, numUpdated) {}
      );
      coll2.find({}, function (err, docs) {
        res.render("index2.hbs", { dane: docs });
      });
    });
  });
});

app.get("/cancel", function (req, res) {
  coll2.findOne({ _id: req.query.id }, function (err, doc) {
    doc.edit = false;
    coll2.update(
      { _id: req.query.id },
      { $set: doc },
      {},
      function (err, numUpdated) {}
    );
    coll2.find({}, function (err, docs) {
      res.render("index2.hbs", { dane: docs });
    });
  });
});

app.get("/update", function (req, res) {
  coll2.findOne({ _id: req.query.id }, function (err, doc) {
    doc.ubezpieczony = req.query.ubezpieczony.toUpperCase();
    doc.benzyna = req.query.benzyna.toUpperCase();
    doc.uszkodzony = req.query.uszkodzony.toUpperCase();
    doc.naped4x4 = req.query.naped4x4.toUpperCase();
    doc.edit = false;
    coll2.update(
      { _id: req.query.id },
      { $set: doc },
      {},
      function (err, numUpdated) {}
    );
    coll2.find({}, function (err, docs) {
      res.render("index2.hbs", { dane: docs });
    });
  });
});
app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});

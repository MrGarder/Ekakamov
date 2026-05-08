const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB = "./members.json";

if (!fs.existsSync(DB)) {
    fs.writeFileSync(DB, "[]");
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB));
}

function writeDB(data) {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// ===== ПОЛУЧИТЬ ВСЕХ =====

app.get("/admin/get-members", (req, res) => {

    const members = readDB();

    res.json(members);
});

// ===== СОХРАНИТЬ =====

app.post("/admin/update-member", (req, res) => {

    const {
        password,
        name,
        rank,
        warns,
        online
    } = req.body;

    if (password !== "admin123") {
        return res.status(403).send("wrong password");
    }

    let members = readDB();

    let existing = members.find(
        m => m.name === name
    );

    if (existing) {

        existing.rank = rank;
        existing.warns = warns;
        existing.online = online;

    } else {

        members.push({
            name,
            rank,
            warns,
            online
        });
    }

    writeDB(members);

    res.sendStatus(200);
});

// ===== ВЫГОВОРЫ =====

app.post("/admin/update-warns", (req, res) => {

    const {
        password,
        name,
        delta
    } = req.body;

    if (password !== "admin123") {
        return res.status(403).send("wrong password");
    }

    let members = readDB();

    let user = members.find(
        m => m.name === name
    );

    if (!user) {
        return res.sendStatus(404);
    }

    if (!user.warns) {
        user.warns = 0;
    }

    user.warns += delta;

    if (user.warns < 0) {
        user.warns = 0;
    }

    writeDB(members);

    res.sendStatus(200);
});

// ===== УДАЛЕНИЕ =====

app.post("/admin/delete-member", (req, res) => {

    const {
        password,
        name
    } = req.body;

    if (password !== "admin123") {
        return res.status(403).send("wrong password");
    }

    let members = readDB();

    members = members.filter(
        m => m.name !== name
    );

    writeDB(members);

    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log("SERVER STARTED");
});

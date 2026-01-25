const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// ВОТ ЗДЕСЬ МЫ МЕНЯЕМ ПАРОЛЬ НА ТВОЙ
const MY_SECRET_PASS = "01050302"; 

const DATA_FILE = './statuses.json';

function getFamilyData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return {};
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}');
    } catch (e) { return {}; }
}

app.get('/get-statuses', (req, res) => res.json(getFamilyData()));

app.post('/admin/update-member', (req, res) => {
    const { password, name, rank, warns, online } = req.body;

    // Проверка пароля (убираем пробелы и приводим к строке)
    if (String(password).trim() !== MY_SECRET_PASS) {
        console.log(`[ОТКАЗ] Кто-то ввел неверный пароль: ${password}`);
        return res.status(403).json({ error: 'WRONG_PASS' });
    }

    if (name === "CHECK_AUTH") return res.json({ status: 'auth_ok' });

    let data = getFamilyData();
    data[name] = {
        rank: rank || (data[name] ? data[name].rank : "Кандидат"),
        warns: warns !== undefined ? parseInt(warns) : (data[name] ? data[name].warns : 0),
        online: online !== undefined ? (online === true || online === "true") : (data[name] ? data[name].online : false)
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ status: 'ok' });
});

app.post('/admin/delete-member', (req, res) => {
    const { password, name } = req.body;
    if (String(password).trim() !== MY_SECRET_PASS) return res.status(403).send('FAIL');

    let data = getFamilyData();
    delete data[name];
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ status: 'deleted' });
});

app.listen(3000, () => {
    console.log(`\n=========================================`);
    console.log(`СЕРВЕР ОБНОВЛЕН!`);
    console.log(`НОВЫЙ ПАРОЛЬ: ${MY_SECRET_PASS}`); // Должно писать 01050302
    console.log(`=========================================\n`);
});





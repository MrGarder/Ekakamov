const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Твоя ссылка с рабочим паролем
const mongoURI = "mongodb+srv://mrgarderreddragon_db_user:RedDragon2026@cluster0.yxx1kto.mongodb.net/familyDB?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect(mongoURI)
    .then(() => console.log("✅ БАЗА ПОДКЛЮЧЕНА!"))
    .catch(err => console.error("❌ ОШИБКА БАЗЫ:", err.message));

const Member = mongoose.model('Member', new mongoose.Schema({
    name: { type: String, unique: true },
    rank: String,
    warns: Number,
    online: Boolean
}));

// Получение списка (для главной)
app.get('/get-statuses', async (req, res) => {
    try {
        const members = await Member.find();
        const data = {};
        members.forEach(m => { data[m.name] = { rank: m.rank, warns: m.warns, online: m.online }; });
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// СОХРАНЕНИЕ / ИЗМЕНЕНИЕ
app.post('/admin/update-member', async (req, res) => {
    const { password, name, online, rank, warns } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");
    try {
        await Member.findOneAndUpdate(
            { name: name.trim() },
            { rank, online, warns },
            { upsert: true }
        );
        res.send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

// УДАЛЕНИЕ (УВОЛЬНЕНИЕ) — ВОТ ЭТОТ КУСОК НУЖЕН!
app.post('/admin/delete-member', async (req, res) => {
    const { password, name } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");
    try {
        await Member.findOneAndDelete({ name: name.trim() });
        res.send("DELETED");
    } catch (e) { res.status(500).send(e.message); }
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));

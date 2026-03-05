const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const mongoURI = process.env.MONGO_URL || "mongodb+srv://dragon777:Dragon2026Strong@cluster0.yxx1kto.mongodb.net/familyDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI).then(() => {
    console.log("✅ БАЗА ПОДКЛЮЧЕНА!");
}).catch(err => console.log("❌ ОШИБКА:", err.message));

const Member = mongoose.model('Member', new mongoose.Schema({
    name: { type: String, unique: true },
    rank: String,
    warns: { type: Number, default: 0 },
    online: Boolean
}));

// 1. СОХРАНЕНИЕ / ИЗМЕНЕНИЕ (Уже было)
app.post('/admin/update-member', async (req, res) => {
    const { password, name, online, rank, warns } = req.body;
    if (password !== "01050302") return res.status(403).send("Неверный пароль!");
    if (!name) return res.status(400).send("Введите ник!");

    try {
        await Member.findOneAndUpdate(
            { name: name.trim() }, 
            { rank, online, warns: parseInt(warns) || 0 }, 
            { upsert: true }
        );
        res.send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

// 2. ИЗМЕНЕНИЕ ВЫГОВОРОВ (Добавил!)
app.post('/admin/update-warns', async (req, res) => {
    const { password, name, delta } = req.body;
    if (password !== "01050302") return res.status(403).send("Пароль!");
    
    try {
        const m = await Member.findOne({ name });
        if (m) {
            m.warns = Math.max(0, (m.warns || 0) + delta);
            await m.save();
            res.send("OK");
        } else { res.status(404).send("Не найден"); }
    } catch (e) { res.status(500).send(e.message); }
});

// 3. УДАЛЕНИЕ (Добавил!)
app.post('/admin/delete-member', async (req, res) => {
    const { password, name } = req.body;
    if (password !== "01050302") return res.status(403).send("Пароль!");

    try {
        await Member.deleteOne({ name });
        res.send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

// 4. СПИСКИ (Уже было)
app.get('/admin/get-members', async (req, res) => {
    const members = await Member.find().sort({ name: 1 });
    res.json(members);
});

app.get('/get-statuses', async (req, res) => {
    const members = await Member.find();
    const data = {};
    members.forEach(m => { data[m.name] = { rank: m.rank, warns: m.warns, online: m.online }; });
    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Порт ${PORT}`));

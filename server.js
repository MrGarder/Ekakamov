const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = "mongodb+srv://mrgarderreddragon_db_user:RedDragon2026@cluster0.yxx1kto.mongodb.net/familyDB?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect(mongoURI)
    .then(() => console.log("✅ БАЗА ПОДКЛЮЧЕНА!"))
    .catch(err => console.error("❌ ОШИБКА БАЗЫ:", err.message));

const Member = mongoose.model('Member', new mongoose.Schema({
    name: { type: String, unique: true },
    rank: String,
    warns: { type: Number, default: 0 },
    online: Boolean
}));

// Быстрое изменение выговоров (+/-)
app.post('/admin/update-warns', async (req, res) => {
    const { password, name, delta } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");
    try {
        const member = await Member.findOne({ name: name });
        if (!member) return res.status(404).send("Not found");
        
        let newWarns = (member.warns || 0) + delta;
        if (newWarns < 0) newWarns = 0;
        if (newWarns > 3) newWarns = 3;

        member.warns = newWarns;
        await member.save();
        res.json({ newWarns });
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/admin/get-members', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/admin/update-member', async (req, res) => {
    const { password, name, online, rank, warns } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");
    try {
        await Member.findOneAndUpdate({ name: name.trim() }, { rank, online, warns }, { upsert: true });
        res.send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/admin/delete-member', async (req, res) => {
    const { password, name } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");
    try {
        await Member.findOneAndDelete({ name: name.trim() });
        res.send("DELETED");
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/get-statuses', async (req, res) => {
    try {
        const members = await Member.find();
        const data = {};
        members.forEach(m => { data[m.name] = { rank: m.rank, warns: m.warns, online: m.online }; });
        res.json(data);
    } catch (e) { res.status(500).send(e.message); }
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));

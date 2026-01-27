const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// ТВОЯ ССЫЛКА (ОБЯЗАТЕЛЬНО ЗАМЕНИ 'ТВОЙ_ПАРОЛЬ' НА РЕАЛЬНЫЙ ПАРОЛЬ ОТ ПОЛЬЗОВАТЕЛЯ БАЗЫ)
const mongoURI = "mongodb+srv://mrgarderreddragon_db_user:ТВОЙ_ПАРОЛЬ@cluster0.yxx1kto.mongodb.net/familyDB?retryWrites=true&w=majority";

app.use(express.json());
app.use(express.static(__dirname));

// Подключение к MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log("БАЗА ПОДКЛЮЧЕНА — ТЕПЕРЬ НИЧЕГО НЕ ПРОПАДЕТ!"))
    .catch(err => console.log("ОШИБКА БАЗЫ:", err));

// Схема данных участника
const memberSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    rank: String,
    warns: Number,
    online: Boolean
});

const Member = mongoose.model('Member', memberSchema);

// Получить всех участников
app.get('/get-statuses', async (req, res) => {
    try {
        const members = await Member.find();
        const data = {};
        members.forEach(m => {
            data[m.name] = { rank: m.rank, warns: m.warns, online: m.online };
        });
        res.json(data);
    } catch (e) { res.status(500).send(e); }
});

// Добавить или обновить участника
app.post('/admin/update-member', async (req, res) => {
    const { password, name, online, rank, warns } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");

    try {
        await Member.findOneAndUpdate(
            { name: name },
            { 
                rank: rank || "[1] Кандидат", 
                online: online !== undefined ? online : false, 
                warns: warns !== undefined ? warns : 0 
            },
            { upsert: true, new: true }
        );
        res.send("OK");
    } catch (e) { res.status(500).send(e); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

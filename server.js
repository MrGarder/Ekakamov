const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Твоя ссылка для подключения к MongoDB
const mongoURI = "mongodb+srv://mrgarderreddragon_db_user:01050302@cluster0.yxx1kto.mongodb.net/familyDB?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.json());
app.use(express.static(__dirname));

// Подключение к базе данных
mongoose.connect(mongoURI)
    .then(() => console.log("БАЗА ПОДКЛЮЧЕНА — ВСЁ ГУД!"))
    .catch(err => console.error("ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ:", err));

// Описание того, как хранить участника в базе
const memberSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    rank: { type: String, default: "[1] Кандидат" },
    warns: { type: Number, default: 0 },
    online: { type: Boolean, default: false }
});

const Member = mongoose.model('Member', memberSchema);

// Маршрут для получения списка всех участников
app.get('/get-statuses', async (req, res) => {
    try {
        const members = await Member.find();
        const data = {};
        members.forEach(m => {
            data[m.name] = { rank: m.rank, warns: m.warns, online: m.online };
        });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Ошибка при получении данных" });
    }
});

// Маршрут для добавления/обновления участника через админку
app.post('/admin/update-member', async (req, res) => {
    const { password, name, online, rank, warns } = req.body;
    
    // Проверка пароля админа
    if (password !== "01050302") {
        return res.status(403).send("Неверный пароль админа");
    }

    if (!name) return res.status(400).send("Ник игрока обязателен");

    try {
        await Member.findOneAndUpdate(
            { name: name },
            { 
                rank: rank, 
                online: online, 
                warns: warns 
            },
            { upsert: true, new: true }
        );
        res.send("OK");
    } catch (e) {
        console.error("Ошибка сохранения:", e);
        res.status(500).send("Ошибка базы данных");
    }
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

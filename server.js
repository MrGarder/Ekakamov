const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ВАЖНО: Пароль в ссылке изменен на RedDragon2026. 
// Установи такой же пароль для пользователя mrgarderreddragon_db_user в панели MongoDB Atlas!
const mongoURI = "mongodb+srv://mrgarderreddragon_db_user:RedDragon2026@cluster0.yxx1kto.mongodb.net/familyDB?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.json());
app.use(express.static(__dirname));

// Подключение к MongoDB с настройками стабильности
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000 // Ждать ответа от базы не дольше 5 секунд
})
.then(() => console.log("✅ БАЗА ПОДКЛЮЧЕНА — ТЕПЕРЬ ВСЁ РАБОТАЕТ!"))
.catch(err => console.error("❌ ОШИБКА БАЗЫ (Проверь пароль в Atlas!):", err.message));

const memberSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    rank: { type: String, default: "[1] Кандидат" },
    warns: { type: Number, default: 0 },
    online: { type: Boolean, default: false }
});

const Member = mongoose.model('Member', memberSchema);

app.get('/get-statuses', async (req, res) => {
    try {
        const members = await Member.find();
        const data = {};
        members.forEach(m => {
            data[m.name] = { rank: m.rank, warns: m.warns, online: m.online };
        });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Ошибка получения данных" });
    }
});

app.post('/admin/update-member', async (req, res) => {
    const { password, name, online, rank, warns } = req.body;
    
    // Пароль для входа в саму админку оставляем твой старый
    if (password !== "01050302") {
        return res.status(403).send("Неверный пароль админа");
    }

    if (!name) return res.status(400).send("Ник игрока обязателен");

    try {
        await Member.findOneAndUpdate(
            { name: name.trim() },
            { rank, online, warns },
            { upsert: true, new: true }
        );
        res.send("OK");
    } catch (e) {
        console.error("Ошибка при сохранении в базу:", e);
        res.status(500).send("Ошибка базы данных");
    }
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));

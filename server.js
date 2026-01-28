// ... (весь верхний код оставляешь как есть)

// Маршрут для УДАЛЕНИЯ (увольнения)
app.post('/admin/delete-member', async (req, res) => {
    const { password, name } = req.body;
    if (password !== "01050302") return res.status(403).send("Wrong password");

    try {
        await Member.findOneAndDelete({ name: name.trim() });
        res.send("DELETED");
    } catch (e) {
        res.status(500).send("Ошибка при удалении");
    }
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));

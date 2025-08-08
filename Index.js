const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('✅ API en ligne.');
});

app.get('/get-assets', async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.status(400).json({ error: 'UserID manquant' });

  try {
    const catalogUrl = `https://catalog.roblox.com/v1/search/items/details?Category=Clothing&Subcategory=Shirts,Pants&CreatorTargetId=${userId}&SortType=3&Limit=30`;
    const catalogRes = await axios.get(catalogUrl);
    const items = catalogRes.data.data;

    const gamesUrl = `https://games.roblox.com/v2/users/${userId}/games?limit=10&sortOrder=Asc`;
    const gamesRes = await axios.get(gamesUrl);
    const gamepasses = [];

    for (const game of gamesRes.data.data) {
      const gpUrl = `https://games.roblox.com/v1/games/${game.id}/game-passes`;
      const gpRes = await axios.get(gpUrl);
      const passes = gpRes.data.data;

      for (const pass of passes) {
        if (pass.creator.id == parseInt(userId) && pass.price > 0) {
          gamepasses.push({
            name: pass.name,
            id: pass.id,
            price: pass.price
          });
        }
      }
    }

    res.json({
      userId,
      shirtsAndPants: items,
      gamepasses
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
);

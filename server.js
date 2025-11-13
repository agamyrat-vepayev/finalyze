import app from './app.js';
import config from './config/config.js';
import sequelize from './config/database.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MSSQL Database Connected');

    app.listen(config.port, () => {
        console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
        throw error('Unable to connect to the database:', error)
  }
})();

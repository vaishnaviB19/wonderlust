const multer = require('multer');

// Store files in memory instead of disk
const storage = multer.memoryStorage();

module.exports = multer({ storage });

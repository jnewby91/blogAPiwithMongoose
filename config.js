"use strict"; 
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/blogdatabase";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-blogdatabase";
exports.PORT = process.env.PORT || 8080; 

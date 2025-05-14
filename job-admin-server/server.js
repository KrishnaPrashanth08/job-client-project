// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const { title, location, job_type, salary_min, salary_max } = req.query;
    
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    
    if (title) {
      query += ' AND title ILIKE $' + (params.length + 1);
      params.push(`%${title}%`);
    }
    
    if (location) {
      query += ' AND location ILIKE $' + (params.length + 1);
      params.push(`%${location}%`);
    }
    
    if (job_type) {
      query += ' AND job_type = $' + (params.length + 1);
      params.push(job_type);
    }
    
    if (salary_min && salary_max) {
      query += ' AND salary_min >= $' + (params.length + 1);
      query += ' AND salary_max <= $' + (params.length + 2);
      params.push(salary_min, salary_max);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/jobs', async (req, res) => {
  const {
    title,
    company,
    location,
    job_type,
    salary_min,
    salary_max,
    description,
    requirements,
    responsibilities,
    application_deadline,
    logo_url,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jobs 
        (title, company, location, job_type, salary_min, salary_max, description, requirements, responsibilities, application_deadline, logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        title,
        company,
        location,
        job_type,
        salary_min,
        salary_max,
        description,
        requirements,
        responsibilities,
        application_deadline,
        logo_url,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

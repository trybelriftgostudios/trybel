#!/usr/bin/env node
import 'dotenv/config';
import pkg from 'pg';
import { v2 as cloudinary } from 'cloudinary';

const { Pool } = pkg;

async function checkServices() {
  console.log('\n======================================================');
  console.log('   Trybel Infrastructure Diagnostics & Health Check   ');
  console.log('======================================================\n');

  // 1. Test PostgreSQL Connection
  console.log('1. Checking PostgreSQL Database...');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('   ⚠️ DATABASE_URL is not set in backend/.env');
    console.log('   👉 Status: Using Local JSON Snapshot Cache (Zero-Downtime Fallback)\n');
  } else {
    console.log(`   Connecting to: ${dbUrl.replace(/:([^:@]+)@/, ':****@')}`);
    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production' || dbUrl.includes('neon.tech') || dbUrl.includes('supabase.co')
        ? { rejectUnauthorized: false }
        : undefined
    });

    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as server_time, version()');
      client.release();
      console.log('   ✅ PostgreSQL Connected Successfully!');
      console.log(`   Server time: ${res.rows[0].server_time}`);
      console.log(`   Engine: ${res.rows[0].version.split(' ')[0]} ${res.rows[0].version.split(' ')[1]}\n`);
    } catch (err) {
      console.log(`   ⚠️ Could not connect to PostgreSQL: ${err.message}`);
      console.log('   👉 Status: Fallback Active (local-products-fallback.json, local-homepage-fallback.json)\n');
    } finally {
      await pool.end().catch(() => {});
    }
  }

  // 2. Test Cloudinary Media & Asset Storage
  console.log('2. Checking Cloudinary Media Storage (v2)...');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.log('   ⚠️ Cloudinary credentials missing in backend/.env');
    console.log('   👉 Status: Using Local Simulator CDN (Unsplash / Simulation URLs)\n');
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    try {
      const pingRes = await cloudinary.api.ping();
      console.log('   ✅ Cloudinary v2 Connected Successfully!');
      console.log(`   Cloud Name: ${cloudName}`);
      console.log(`   API Ping: ${pingRes.status}\n`);
    } catch (err) {
      console.log(`   ⚠️ Cloudinary ping failed: ${err.message}`);
      console.log('   👉 Status: Fallback Active (Local media simulation)\n');
    }
  }

  console.log('======================================================\n');
}

checkServices();

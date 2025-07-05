const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xcmcpxobavebxreywblu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbWNweG9iYXZlYnhyZXl3Ymx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDI0ODUsImV4cCI6MjA2NzI3ODQ4NX0.9_vR2LDFRIGYXi3nyGvXOlrgWXpYtSe1_15VBuaXiek';


// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('🌐 Using Supabase database');


// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing Supabase database...');
    
    // Test connection by trying to select from contacts table
    const { data, error } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
      // Tables don't exist - show manual setup instructions
      console.log('❌ Tables not found in Supabase!');
      console.log('📋 Please run this SQL in your Supabase Dashboard:');
      console.log('🔗 https://supabase.com/dashboard/project/xcmcpxobavebxreywblu/sql');
      console.log('📄 Copy and paste this SQL:');
      console.log('='.repeat(60));
      
      const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema_supabase.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(sql);
      
      console.log('='.repeat(60));
      console.log('⚡ After running the SQL, restart the server');
      console.log('🚫 Server will not work until tables are created!');
      
      process.exit(1);
      
    } else if (error) {
      console.error('❌ Supabase connection error:', error);
      console.log('🚫 Cannot connect to Supabase. Check your credentials and network.');
      process.exit(1);
    } else {
      console.log('✅ Supabase database ready');
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.log('🚫 Cannot initialize Supabase database. Exiting...');
    process.exit(1);
  }
};

// Initialize on startup
initializeDatabase();

module.exports = { supabase };
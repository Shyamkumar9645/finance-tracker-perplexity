#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xcmcpxobavebxreywblu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbWNweG9iYXZlYnhyZXl3Ymx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDI0ODUsImV4cCI6MjA2NzI3ODQ4NX0.9_vR2LDFRIGYXi3nyGvXOlrgWXpYtSe1_15VBuaXiek';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema_supabase.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Clean up SQL and split into commands
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📄 Executing ${commands.length} SQL commands...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        try {
          console.log(`📋 Executing command ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
          
          // Try to execute using SQL
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_command: command 
          });
          
          if (error) {
            // If RPC fails, try using REST API for specific operations
            if (command.toUpperCase().includes('CREATE TABLE')) {
              console.log('⚠️  Direct SQL execution not available, trying REST API approach...');
              
              // For CREATE TABLE, we'll use a different approach
              // This will be handled by manual execution fallback
              throw new Error('CREATE TABLE requires admin privileges');
            } else {
              console.log(`⚠️  Warning: ${error.message}`);
            }
          } else {
            console.log(`✅ Command ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Command ${i + 1} failed: ${err.message}`);
          
          // For critical commands, we need to fail
          if (command.toUpperCase().includes('CREATE TABLE')) {
            throw err;
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Test that tables were created
    const { data, error } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
      throw new Error('Tables were not created successfully');
    }
    
    console.log('🎉 Database is ready!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('📋 Please run the following SQL manually in your Supabase Dashboard:');
    console.log('🔗 https://supabase.com/dashboard/project/xcmcpxobavebxreywblu/sql');
    console.log('📄 Copy and paste this SQL:');
    console.log('='.repeat(80));
    
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema_supabase.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(sql);
    
    console.log('='.repeat(80));
    console.log('⚡ After running the SQL, restart the server with: npm run server');
    console.log('');
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
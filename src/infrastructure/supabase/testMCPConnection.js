/**
 * Test Supabase MCP Connection
 * 
 * This utility helps verify that your Supabase MCP connection is working correctly.
 * 
 * Usage:
 *   import { testMCPConnection } from './infrastructure/supabase/testMCPConnection'
 *   await testMCPConnection()
 */

import { supabaseMCP } from './supabaseMCPClient.js'

/**
 * Test the MCP connection by making a simple request
 * @returns {Promise<Object>} Test results
 */
export async function testMCPConnection() {
  console.log('🔍 Testing Supabase MCP connection...\n')

  // Check if MCP is configured
  if (!supabaseMCP.isConfigured) {
    console.error('❌ MCP is not configured!')
    console.error('\nPlease set the following in your .env file:')
    console.error('  VITE_SUPABASE_MCP_PAT=your-personal-access-token')
    console.error('  VITE_SUPABASE_MCP_URL=https://mcp.supabase.com/mcp (optional, this is the default)')
    console.error('  VITE_SUPABASE_PROJECT_REF=your-project-ref (optional)')
    console.error('\nGet your PAT from: https://app.supabase.com → Settings → Access Tokens')
    return {
      success: false,
      error: 'MCP not configured',
    }
  }

  try {
    // Test 1: List tables (simple operation)
    console.log('📋 Test 1: Listing tables...')
    const tables = await supabaseMCP.listTables()
    console.log('✅ Successfully listed tables:', tables)
    
    // Test 2: Get schema
    console.log('\n📊 Test 2: Getting schema...')
    const schema = await supabaseMCP.getSchema()
    console.log('✅ Successfully retrieved schema')
    
    // Test 3: Execute a simple query
    console.log('\n🔍 Test 3: Executing test query...')
    const queryResult = await supabaseMCP.executeQuery('SELECT 1 as test')
    console.log('✅ Successfully executed query:', queryResult)

    console.log('\n✨ All MCP connection tests passed!')
    return {
      success: true,
      tables,
      schema,
      queryResult,
    }
  } catch (error) {
    console.error('\n❌ MCP connection test failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('Unauthorized')) {
      console.error('\n💡 Tip: Check that your Personal Access Token (PAT) is correct and hasn\'t expired.')
    } else if (error.message.includes('fetch')) {
      console.error('\n💡 Tip: Check your network connection and MCP endpoint URL.')
    }
    
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Quick connection check (non-blocking)
 * @returns {boolean} True if MCP is configured
 */
export function isMCPConfigured() {
  return supabaseMCP.isConfigured
}

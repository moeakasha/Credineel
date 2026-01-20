/**
 * Supabase MCP Client
 * 
 * This service uses the Supabase MCP (Model Context Protocol) server
 * to interact with Supabase for database operations, schema management, etc.
 * 
 * MCP Server Endpoint: https://mcp.supabase.com/mcp
 * 
 * For local development, you can use: http://localhost:54321/mcp
 * (when running Supabase locally via CLI)
 */

/**
 * MCP Client Configuration
 * Uses the Supabase MCP server for advanced operations
 */
class SupabaseMCPClient {
  constructor() {
    // MCP server endpoint
    this.mcpEndpoint = import.meta.env.VITE_SUPABASE_MCP_URL || 'https://mcp.supabase.com/mcp'
    
    // Project reference (optional, can be passed in requests)
    this.projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF || ''
    
    // Personal Access Token for MCP authentication
    // IMPORTANT: This should be stored securely and never exposed to frontend
    // For production, use a backend service to proxy MCP requests
    this.pat = import.meta.env.VITE_SUPABASE_MCP_PAT || ''
    
    // Check if MCP is configured
    this.isConfigured = !!this.pat && this.pat !== ''
  }

  /**
   * Make an MCP request to Supabase
   * @param {string} tool - MCP tool name (e.g., 'query', 'schema', 'execute_sql')
   * @param {Object} params - Parameters for the tool
   * @returns {Promise<Object>} Response from MCP server
   */
  async mcpRequest(tool, params = {}) {
    if (!this.isConfigured) {
      throw new Error(
        'Supabase MCP is not configured. Please set VITE_SUPABASE_MCP_PAT in your .env file.\n' +
        'Note: For security, MCP should typically be used from a backend service, not directly from the frontend.'
      )
    }

    try {
      const url = this.projectRef 
        ? `${this.mcpEndpoint}?project_ref=${this.projectRef}`
        : this.mcpEndpoint

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pat}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: tool,
            arguments: params,
          },
          id: Date.now().toString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(error.message || `MCP request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message || 'MCP request error')
      }

      return data.result
    } catch (error) {
      console.error('MCP request error:', error)
      throw error
    }
  }

  /**
   * Execute a SQL query via MCP
   * @param {string} sql - SQL query to execute
   * @returns {Promise<Object>} Query results
   */
  async executeQuery(sql) {
    return this.mcpRequest('query', { sql })
  }

  /**
   * Get database schema via MCP
   * @returns {Promise<Object>} Schema information
   */
  async getSchema() {
    return this.mcpRequest('schema', {})
  }

  /**
   * List tables via MCP
   * @returns {Promise<Array>} List of tables
   */
  async listTables() {
    return this.mcpRequest('list_tables', {})
  }
}

// Export singleton instance
export const supabaseMCP = new SupabaseMCPClient()
export default supabaseMCP

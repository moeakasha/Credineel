import { supabase } from '../supabase/supabaseClient'

/**
 * Rule Service
 * Handles data fetching and updates for eligibility rules from Supabase
 */

/**
 * Fetch all eligibility rules grouped by category
 * @returns {Promise<Array>}
 */
export const fetchRules = async () => {
  try {
    const { data, error } = await supabase
      .from('eligibility_rules')
      .select('*')
      .order('category', { ascending: true })
      .order('rule_name', { ascending: true })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching rules:', error)
    throw error
  }
}

/**
 * Update a specific rule's weight or criteria
 * @param {string} id - Rule UUID
 * @param {Object} updates - Fields to update (weight_pct, min_value, max_value, label)
 * @returns {Promise<Object>}
 */
export const updateRule = async (id, updates) => {
  if (!id) throw new Error('Rule ID is required for update');

  try {
    const { data, error } = await supabase
      .from('eligibility_rules')
      .update(updates)
      .match({ id })
      .select()

    if (error) throw error
    if (!data || data.length === 0) throw new Error('No rule found with the given ID');

    return data[0]
  } catch (error) {
    console.error('Error updating rule:', error)
    throw error
  }
}

/**
 * Trigger total system recalculation manually
 * Note: Database trigger should handle this automatically on rule update
 * @returns {Promise<void>}
 */
export const recalculateAllScores = async () => {
  try {
    const { error } = await supabase.rpc('recalculate_all_customer_scores')
    if (error) throw error
  } catch (error) {
    console.error('Error triggering recalculation:', error)
    throw error
  }
}

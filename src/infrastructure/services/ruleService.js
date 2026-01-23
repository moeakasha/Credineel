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

/**
 * Fetch eligibility rules edit history
 * @returns {Promise<Array>}
 */
export const fetchRulesHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('eligibility_rules_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching rules history:', error)
    throw error
  }
}

/**
 * Save a snapshot of the current rules and thresholds to history
 * @param {Object} editorInfo - { name, email, avatar_url }
 * @returns {Promise<Object>}
 */
export const saveRuleHistory = async (editorInfo) => {
  try {
    // Get current rules
    const { data: rules, error: rulesError } = await supabase
      .from('eligibility_rules')
      .select('*')
    if (rulesError) throw rulesError

    // Get current thresholds
    const { data: thresholds, error: thresholdsError } = await supabase
      .from('score_thresholds')
      .select('*')
    if (thresholdsError) throw thresholdsError

    const { data, error } = await supabase
      .from('eligibility_rules_history')
      .insert({
        editor_name: editorInfo.name,
        editor_email: editorInfo.email,
        editor_avatar_url: editorInfo.avatar_url || null,
        rules_snapshot: rules,
        thresholds_snapshot: thresholds
      })
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving rule history:', error)
    throw error
  }
}

/**
 * Restore rules and thresholds from a history snapshot
 * @param {Object} record - The history record to restore from
 * @returns {Promise<void>}
 */
export const restoreRuleVersion = async (record) => {
  try {
    const { rules_snapshot, thresholds_snapshot } = record

    // Restore rules
    for (const rule of rules_snapshot) {
      const { error } = await supabase
        .from('eligibility_rules')
        .update({
          min_value: rule.min_value,
          max_value: rule.max_value,
          weight_pct: rule.weight_pct,
          label: rule.label
        })
        .match({ id: rule.id })
      if (error) throw error
    }

    // Restore thresholds
    for (const threshold of thresholds_snapshot) {
      const { error } = await supabase
        .from('score_thresholds')
        .update({
          min_value: threshold.min_value,
          color_code: threshold.color_code,
          label: threshold.label,
          sort_order: threshold.sort_order
        })
        .match({ id: threshold.id })
      if (error) throw error
    }
  } catch (error) {
    console.error('Error restoring rule version:', error)
    throw error
  }
}

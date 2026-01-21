import { supabase } from '../supabase/supabaseClient'

/**
 * Fetch all score thresholds ordered by sort_order
 * @returns {Promise<Array>}
 */
export const getScoreThresholds = async () => {
    try {
        const { data, error } = await supabase
            .from('score_thresholds')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching score thresholds:', error)
        throw error
    }
}

/**
 * Update a score threshold
 * @param {string} id 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export const updateScoreThreshold = async (id, updates) => {
    if (!id) throw new Error('Threshold ID is required for update');

    try {
        const { data, error } = await supabase
            .from('score_thresholds')
            .update(updates)
            .match({ id })
            .select()

        if (error) throw error
        if (!data || data.length === 0) throw new Error('No threshold found with the given ID');

        return data[0]
    } catch (error) {
        console.error('Error updating threshold:', error)
        throw error
    }
}

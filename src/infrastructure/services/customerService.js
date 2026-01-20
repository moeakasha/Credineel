import { supabase } from '../supabase/supabaseClient'

/**
 * Customer Service
 * Handles data fetching for customers from Supabase
 */

/**
 * Fetch a paginated list of customers
 * @param {Object} options - Fetch options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.pageSize - Number of records per page
 * @param {string} options.status - Filter by eligibility status (all, green, yellow, amber)
 * @param {string} options.searchTerm - Search by name or ID
 * @returns {Promise<{data: Array, totalCount: number}>}
 */
export const fetchCustomers = async ({
    page = 1,
    pageSize = 100,
    status = 'all',
    searchTerm = '',
    sortField = 'Final Score',
    sortOrder = 'desc'
}) => {
    try {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase
            .from('SIBBANKDATA')
            .select('*', { count: 'exact' })

        // Apply filters
        if (status !== 'all') {
            // Capitalize first letter to match DB values (Green, Yellow, Amber)
            const dbStatus = status.charAt(0).toUpperCase() + status.slice(1)
            query = query.eq('Eligibility Status', dbStatus)
        }

        if (searchTerm) {
            const isNumeric = /^\d+$/.test(searchTerm)
            if (isNumeric) {
                query = query.or(`"Full Name".ilike.%${searchTerm}%,"National ID".eq.${searchTerm}`)
            } else {
                query = query.ilike('Full Name', `%${searchTerm}%`)
            }
        }

        // Ordering
        query = query.order(sortField, { ascending: sortOrder === 'asc' })

        // Pagination
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) throw error

        return {
            data: data.map(mapCustomerToUI),
            totalCount: count || 0
        }
    } catch (error) {
        console.error('Error fetching customers:', error)
        throw error
    }
}

/**
 * Fetch single customer details by UID
 * @param {number|string} uid - Customer unique ID
 * @returns {Promise<Object>}
 */
export const fetchCustomerById = async (uid) => {
    try {
        const { data, error } = await supabase
            .from('SIBBANKDATA')
            .select('*')
            .eq('uid', uid)
            .single()

        if (error) throw error

        return mapCustomerToUI(data)
    } catch (error) {
        console.error('Error fetching customer details:', error)
        throw error
    }
}

/**
 * Helper to map DB row to UI customer object
 * @param {Object} item - DB row
 * @returns {Object} UI customer object
 */
const mapCustomerToUI = (item) => {
    if (!item) return null

    // Get initials from name
    const nameParts = (item['Full Name'] || '').split(' ')
    const initials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (item['Full Name']?.[0] || 'C').toUpperCase()

    return {
        id: item.uid,
        name: item['Full Name'],
        initials: initials,
        accountNumber: item['Reg No'],
        branch: item['Branch'],
        averageBalance: item['Avarage Balance'] || 0,
        mobileNumber: item['Mobile'],
        email: item['Email'],
        status: (item['Eligibility Status'] || '').toLowerCase(),
        // Full details for slider
        fullName: item['Full Name'],
        arabicName: item['Full Name Arabic'],
        nationalId: item['National ID'],
        dateOfBirth: item['Date of Birth'],
        joiningDate: item['Joining date'],
        yearsWithBank: item['Years with Bank'],
        homeAddress: item['Home Address'],
        numberOfChildren: item['Number of Children'],
        maritalStatus: item['Status'],
        jobTitle: item['Job Tittle'],
        jobAddress: item['Job Address'],
        lastBalance: item['Last Balance'] || 0,
        txSuccessRate: parseFloat((item['Success Rate'] || '0').replace('%', '')),
        score: parseFloat(item['Final Score'] || 0),
    }
}

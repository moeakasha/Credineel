import { supabase } from '../supabase/supabaseClient'

/**
 * Dashboard Service
 * Handles all data fetching for the dashboard
 */

/**
 * Fetch portfolio overview metrics
 * - Portfolio size: Sum of Last Balance for all customers
 * - Total customers: Count from SIBBANKDATA
 * - Private Banking: Count of green customers only
 * - Eligible customers: Total of green + yellow (excluding amber)
 */
export const fetchPortfolioMetrics = async () => {
    try {
        const { data, error } = await supabase
            .rpc('get_portfolio_metrics')
            .single()

        if (error) {
            // Fallback to manual query if RPC doesn't exist
            const { data: rawData, error: queryError } = await supabase
                .from('SIBBANKDATA')
                .select(`
          "Last Balance",
          "Eligibility Status"
        `)

            if (queryError) throw queryError

            // Calculate metrics manually
            const portfolioSize = rawData.reduce((sum, row) => sum + (row['Last Balance'] || 0), 0)
            const totalCustomers = rawData.length
            const greenCustomers = rawData.filter(row => row['Eligibility Status'] === 'Green').length
            const yellowCustomers = rawData.filter(row => row['Eligibility Status'] === 'Yellow').length
            const amberCustomers = rawData.filter(row => row['Eligibility Status'] === 'Amber').length
            const eligibleCustomers = greenCustomers + yellowCustomers

            // Calculate averages
            const totalScore = rawData.reduce((sum, row) => sum + (parseFloat(row['Final Score']) || 0), 0)
            const avgCreditScore = totalCustomers > 0 ? Math.round(totalScore / totalCustomers) : 0

            const totalSuccessRate = rawData.reduce((sum, row) => {
                const rate = parseFloat((row['Success Rate'] || '0').replace('%', ''))
                return sum + rate
            }, 0)
            const avgSuccessRate = totalCustomers > 0 ? Math.round(totalSuccessRate / totalCustomers) : 0

            return {
                portfolioSize,
                totalCustomers,
                privateBanking: greenCustomers,
                eligibleCustomers,
                greenCustomers,
                yellowCustomers,
                amberCustomers,
                avgCreditScore,
                avgSuccessRate
            }
        }

        return data
    } catch (error) {
        console.error('Error fetching portfolio metrics:', error)
        throw error
    }
}

/**
 * Fetch top 20 green customers ordered by Last Balance
 */
export const fetchTopGreenCustomers = async (limit = 20) => {
    try {
        const { data, error } = await supabase
            .from('SIBBANKDATA')
            .select(`
        uid,
        "Full Name",
        "National ID",
        "Branch",
        "Avarage Balance",
        "Last Balance",
        "Mobile",
        "Final Score"
      `)
            .eq('Eligibility Status', 'Green')
            .order('Last Balance', { ascending: false })
            .limit(limit)

        if (error) throw error

        return data
    } catch (error) {
        console.error('Error fetching top green customers:', error)
        throw error
    }
}

/**
 * Fetch eligibility distribution for charts
 */
export const fetchEligibilityDistribution = async () => {
    try {
        const { data, error } = await supabase
            .from('SIBBANKDATA')
            .select('"Eligibility Status"')

        if (error) throw error

        // Count each status
        const distribution = data.reduce((acc, row) => {
            const status = row['Eligibility Status'] || 'Unknown'
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {})

        const total = data.length

        return {
            green: {
                count: distribution.Green || 0,
                percentage: ((distribution.Green || 0) / total * 100).toFixed(1)
            },
            yellow: {
                count: distribution.Yellow || 0,
                percentage: ((distribution.Yellow || 0) / total * 100).toFixed(1)
            },
            amber: {
                count: distribution.Amber || 0,
                percentage: ((distribution.Amber || 0) / total * 100).toFixed(1)
            }
        }
    } catch (error) {
        console.error('Error fetching eligibility distribution:', error)
        throw error
    }
}

/**
 * Fetch branch insights
 */
export const fetchBranchInsights = async (limit = 3) => {
    try {
        const { data, error } = await supabase
            .rpc('get_top_branches', { limit_count: limit })

        if (error) throw error

        return data.map(item => ({
            name: item.branch,
            value: item.count.toLocaleString()
        }))
    } catch (error) {
        console.error('Error fetching branch insights:', error)
        throw error
    }
}

/**
 * Fetch all dashboard data at once
 */
export const fetchDashboardData = async () => {
    try {
        const [metrics, topCustomers, eligibility, branches] = await Promise.all([
            fetchPortfolioMetrics(),
            fetchTopGreenCustomers(20),
            fetchEligibilityDistribution(),
            fetchBranchInsights(3)
        ])

        return {
            metrics,
            topCustomers,
            eligibility,
            branches
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        throw error
    }
}

import { getCashierDashboardData, getDashboardData } from '../services/dashboardService.js'
export async function dashboardSummary(req, res, next) {
  try {
    const period = ['daily', 'weekly', 'monthly'].includes(req.query.period) ? req.query.period : 'daily'
    // Role check is redundant with the route middleware but kept here as a
    // second guard so this controller is safe even if the route is ever
    // wired up differently in the future.
    if (req.auth.role === 'ADMIN') return res.json(await getDashboardData(period))
    res.json(await getCashierDashboardData(req.auth.sub))
  } catch (error) { next(error) }
}

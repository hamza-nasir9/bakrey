import { getDashboardData } from '../services/dashboardService.js'
export async function dashboardSummary(req, res, next) { try { const period = ['daily','weekly','monthly'].includes(req.query.period) ? req.query.period : 'daily'; res.json(await getDashboardData(period)) } catch (error) { next(error) } }

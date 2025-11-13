import express from 'express'
import { showTotals } from '../controller/income.js'

const router = express.Router()

router.get('/totals', showTotals)

export default router

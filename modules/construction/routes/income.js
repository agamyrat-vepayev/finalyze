import express from 'express'
import { showProvidedServiceTotals } from '../controller/income.js'

const router = express.Router()

router.get('/totals', showProvidedServiceTotals)

export default router

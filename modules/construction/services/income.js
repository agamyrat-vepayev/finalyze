import { fetchProdivedServiceTotals } from "../repositories/income.js";

export async function calculateProvidedServiceTotals() {
    
    const provicedServices = await fetchProdivedServiceTotals()

    const totalTMT = provicedServices.reduce(
        (sum, row) => sum + (row.LINENET || 0), 0
    )

    const totalUSD = provicedServices.reduce(
        (sum, row) => sum + (row.REPORTNET || 0), 0
    )

    return { provicedServices, totalTMT, totalUSD}
}
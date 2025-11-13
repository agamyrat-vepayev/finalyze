import sequelize from '../../../config/database.js'

export async function fetchRevenueTotals() {
    try {
        const query = `
            SELECT 

                CASE 
                    WHEN SVC.LOGICALREF IN (29,31,32) THEN 'Edilen is F2'
                    WHEN SVC.LOGICALREF = 67 THEN 'Konwertasiya'
                    ELSE 'Beylekiler'
                END NAME,
                SUM(STL.LINENET) LINENET,
                SUM(LINENET/IIF(REPORTRATE=0,19.5,REPORTRATE)) REPORTNET

                FROM LG_100_01_STLINE STL
                LEFT JOIN LG_100_SRVCARD SVC ON STL.STOCKREF = SVC.LOGICALREF
                LEFT JOIN LG_100_CLCARD CLC ON STL.CLIENTREF = CLC.LOGICALREF
                LEFT JOIN LG_100_CLCARD CSV ON STL.SPECODE = CSV.CODE

                WHERE STL.TRCODE = 9
                    AND ISNULL(CLC.CODE, CSV.CODE) = '120.02.MR.01.02'

                GROUP BY CASE 
                            WHEN SVC.LOGICALREF IN (29,31,32) THEN 'Edilen is F2'
                            WHEN SVC.LOGICALREF = 67 THEN 'Konwertasiya'
                            ELSE 'Beylekiler'
                         END
        
        `
        const [results] = await sequelize.query(query)
        return results

    } catch (error) {
        console.error("Error fetching provided service totals:", error);
        throw error;
    }
}

export async function fetchExpenseTotals() {
    try {
        const query = `
            SELECT 

                CLC.ADDR1 NAME,

                SUM(CASE
                        WHEN CFL.SIGN = 0 
                            THEN ISNULL(
                                    IIF(STL.OUTCOST=0,OUT.OUTCOST,STL.OUTCOST)
                                        *STL.AMOUNT,
                                    CFL.AMOUNT)
                        WHEN CFL.SIGN = 1 
                            THEN ISNULL(
                                    IIF(STL.OUTCOST=0,OUT.OUTCOST,STL.OUTCOST)
                                        *STL.AMOUNT,
                                    CFL.AMOUNT)*(-1)
                    END) [LINENET],
                SUM(CASE 
                        WHEN CFL.SIGN = 0 AND STL.LOGICALREF IS NULL
                            THEN CFL.REPORTNET
                        WHEN CFL.SIGN = 0 AND STL.LOGICALREF IS NOT NULL
                            THEN 
                                CASE 
                                    WHEN INV.REPORTNET = 0 THEN 0
                                    ELSE IIF(STL.OUTCOST=0,OUT.OUTCOST,STL.OUTCOST)
                                            /(INV.NETTOTAL/INV.REPORTNET)
                                END 
                        WHEN CFL.SIGN = 1 AND STL.LOGICALREF IS NULL
                            THEN CFL.REPORTNET *(-1)
                        WHEN CFL.SIGN = 1 AND STL.LOGICALREF IS NOT NULL
                            THEN 
                                CASE 
                                    WHEN INV.REPORTNET = 0 THEN 0
                                    ELSE IIF(STL.OUTCOST=0,OUT.OUTCOST,STL.OUTCOST)
                                            /(INV.NETTOTAL/INV.REPORTNET)
                                END *(-1)
                    END) [REPORTNET]


                FROM LG_100_CLCARD CLC
                INNER JOIN LG_100_01_CLFLINE CFL ON CLC.LOGICALREF = CFL.CLIENTREF
                LEFT JOIN LG_100_01_INVOICE INV ON CFL.SOURCEFREF = INV.LOGICALREF 
                    AND CFL.MODULENR = 4 AND CFL.TRCODE BETWEEN 31 AND 39
                LEFT JOIN LG_100_01_STLINE STL ON INV.LOGICALREF = STL.INVOICEREF
                    AND STL.LINETYPE <> 1
                LEFT JOIN 
                    (
                        SELECT 
                
                            ROW_NUMBER() OVER(
                                PARTITION BY STOCKREF
                                ORDER BY DATE_ DESC, LOGICALREF DESC
                            ) RN,
                            STOCKREF,
                            IIF(OUTCOST=0,PRICE,OUTCOST) OUTCOST
                
                            FROM LG_100_01_STLINE STL

                            WHERE IIF(OUTCOST=0,PRICE,OUTCOST) <> 0

                    ) OUT ON STL.STOCKREF = OUT.STOCKREF AND OUT.RN = 1


                WHERE LEFT(CLC.CODE, 6) = '170.22'
                        AND CFL.CANCELLED = 0

                GROUP BY CLC.ADDR1

                ORDER BY LINENET DESC

        `
        const [results] = await sequelize.query(query)
        return results

    } catch (error) {
        console.error("Error fetching provided service totals:", error);
        throw error;
    }
}


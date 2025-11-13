import sequelize from '../../../config/database.js'

export async function fetchProdivedServiceTotals() {
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
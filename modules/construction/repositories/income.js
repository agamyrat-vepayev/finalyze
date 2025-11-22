import { Sequelize, SequelizeScopeError } from "sequelize";
import sequelize from "../../../config/database.js";

export async function fetchClientNames() {
  try {
    const query = `

            SELECT 

                CODE,
                DEFINITION_
                
                FROM LG_100_CLCARD
                
                WHERE LEFT(CODE, 6) = '120.05'
                    AND CARDTYPE = 3
                    AND ACTIVE = 0
        `;

    const [results] = await sequelize.query(query);
    return results;
  } catch (error) {
    console.error("Error fetching provided service totals:", error);
    throw error;
  }
}

export async function fetchRevenueTotals(clientCode) {
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
                    AND ISNULL(CLC.CODE, CSV.CODE) = '${
                      clientCode || "120.05.001"
                    }'
                
                GROUP BY CASE 
                            WHEN SVC.LOGICALREF IN (29,31,32) THEN 'Edilen is F2'
                            WHEN SVC.LOGICALREF = 67 THEN 'Konwertasiya'
                            ELSE 'Beylekiler'
                         END
        
        `;
    const [results] = await sequelize.query(query);
    return results;
  } catch (error) {
    console.error("Error fetching provided service totals:", error);
    throw error;
  }
}

export async function fetchExpenseTotals(clientCode) {
  try {
    const query = `
            SELECT 

                CLC.ADDR1 NAME,
                CLC.ADDR2 [CLCODE],
                
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

                WHERE CLC.ADDR2 = '${clientCode || "120.05.001"}'
                        AND CFL.CANCELLED = 0

                GROUP BY CLC.ADDR1,
                        CLC.ADDR2

                ORDER BY LINENET DESC
        `;

    const [results] = await sequelize.query(query);
    return results;
  } catch (error) {
    console.error("Error fetching provided service totals:", error);
    throw error;
  }
}

export async function fetchRevenueDetails(category, clientCode, offset, limit) {
  try {
    const countQuery = `
            SELECT 
                
                COUNT(*) totalRows
                
                FROM LG_100_01_STLINE STL
                LEFT JOIN LG_100_SRVCARD SVC ON STL.STOCKREF = SVC.LOGICALREF
                LEFT JOIN LG_100_CLCARD CLC ON STL.CLIENTREF = CLC.LOGICALREF
                LEFT JOIN LG_100_CLCARD CSV ON STL.SPECODE = CSV.CODE

                WHERE STL.TRCODE = 9
                    AND (CLC.CODE = '${clientCode}' OR CSV.CODE = '${clientCode}')
                    AND CASE 
                            WHEN SVC.LOGICALREF IN (29,31,32) THEN 'Edilen is F2'
                            WHEN SVC.LOGICALREF = 67 THEN 'Konwertasiya'
                            ELSE 'Beylekiler'
                        END = '${category}'
                    
    `;

    const [countResult] = await sequelize.query(countQuery);
    const totalRows = countResult[0].totalRows;

    const query = `
            SELECT 
                CASE 
                    WHEN SVC.LOGICALREF IN (29,31,32) THEN 'Edilen is F2'
                    WHEN SVC.LOGICALREF = 67 THEN 'Konwertasiya'
                    ELSE 'Beylekiler'
                END NAME,
                STL.DATE_,
                SVC.DEFINITION_,
                SVC.SPECODE,
                STL.LINEEXP,
                STL.LINENET LINENET,
                LINENET/IIF(REPORTRATE=0,19.5,REPORTRATE) REPORTNET

                FROM LG_100_01_STLINE STL
                LEFT JOIN LG_100_SRVCARD SVC ON STL.STOCKREF = SVC.LOGICALREF
                LEFT JOIN LG_100_CLCARD CLC ON STL.CLIENTREF = CLC.LOGICALREF
                LEFT JOIN LG_100_CLCARD CSV ON STL.SPECODE = CSV.CODE

                WHERE STL.TRCODE = 9
                    AND CASE 
                            WHEN SVC.LOGICALREF IN (29,31,32) THEN 'Edilen is F2'
                            WHEN SVC.LOGICALREF = 67 THEN 'Konwertasiya'
                            ELSE 'Beylekiler'
                        END = '${category}'
                    AND ISNULL(CLC.CODE, CSV.CODE) = '${clientCode}'
                
                ORDER BY STL.DATE_, STL.LOGICALREF
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
        `;

    const [results] = await sequelize.query(query);
    return { totalRows, results };
  } catch (error) {
    console.error("Error fetching provided service totals:", error);
    throw error;
  }
}

export async function fetchExpenseDetails(category, clientCode, offset, limit) {
  try {
    const countQuery = `
      SELECT COUNT(*) AS totalRows
      FROM LG_100_CLCARD CLC
      INNER JOIN LG_100_01_CLFLINE CFL ON CLC.LOGICALREF = CFL.CLIENTREF
      WHERE LEFT(CLC.CODE, 6) = '170.22'
            AND CFL.CANCELLED = 0
            AND CLC.ADDR1 = '${category}'
            AND CLC.ADDR2 = '${clientCode}'
    `;
    const [countResult] = await sequelize.query(countQuery);
    const totalRows = countResult[0].totalRows;

    const dataQuery = `
            SELECT 
                
                CLC.ADDR1 NAME,
                CFL.DATE_,
                CASE
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 31 THEN 'MAL ALIM'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 34 THEN 'ALINAN HIZMET'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 37 THEN 'PERAKENDE SATIS'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 38 THEN 'TOPTAN SATIS'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 39 THEN 'VERILEN HIZMET'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 32 THEN 'PERAKENDE SATIS IADE'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 33 THEN 'TOPTAN SATIS IADE'
                    WHEN CFL.MODULENR = 4 AND CFL.TRCODE = 36 THEN 'MAL ALIM IADE'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 1 THEN 'NAKIT TAHSILAT'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 2 THEN 'NAKIT ODEME'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 3 THEN 'BORC DEKONTU'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 4 THEN 'ALACAK DEKONTU'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 5 THEN 'VIRMAN ISLEMI'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 6 THEN 'KURFARK ISLEMI'
                    WHEN CFL.MODULENR = 5 AND CFL.TRCODE = 14 THEN 'ACILIS FISI'
                    WHEN CFL.MODULENR = 7 AND CFL.TRCODE = 20 THEN 'GELEN HAVALE'
                    WHEN CFL.MODULENR = 7 AND CFL.TRCODE = 21 THEN 'GONDERILEN HAVALE'
                    WHEN CFL.MODULENR = 10 AND CFL.TRCODE = 1 THEN 'NAKIT TAHSILAT'
                    WHEN CFL.MODULENR = 10 AND CFL.TRCODE = 2 THEN 'NAKIT ODEME'
                END TYPE_,
                ISNULL(STL.LINEEXP, CFL.LINEEXP) [LINEEXP],
                CASE
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
                END [LINENET],
                CASE 
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
                END [REPORTNET]
                
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
                                ORDER BY DATE_ DESC
                            ) RN,
                            STOCKREF,
                            IIF(OUTCOST=0,PRICE,OUTCOST) OUTCOST
                
                            FROM LG_100_01_STLINE STL

                            WHERE IIF(OUTCOST=0,PRICE,OUTCOST) <> 0

                    ) OUT ON STL.STOCKREF = OUT.STOCKREF AND OUT.RN = 1


                WHERE LEFT(CLC.CODE, 6) = '170.22'
                        AND CFL.CANCELLED = 0
                        AND CLC.ADDR1 = '${category}'
                        AND CLC.ADDR2 = '${clientCode}'

                ORDER BY CFL.DATE_, CFL.LOGICALREF
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY;

        `;
    const [results] = await sequelize.query(dataQuery);
    return { results, totalRows };
  } catch (error) {
    console.error("Error fetching provided service totals:", error);
    throw error;
  }
}

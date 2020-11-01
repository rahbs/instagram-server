const { pool } = require("../../../config/database");

// selectBoard
async function selectBoard(email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectEmailQuery = `
                SELECT title, contents 
                FROM Board;
                `;
    const [boardRows] = await connection.query(
        selectEmailQuery
    );
    connection.release();

    return boardRows;
}

module.exports = {
    selectBoard
};

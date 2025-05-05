const { dynamoDB, Tables } = require('../../models/index');


exports.getIssues = async ({ status, startDate, endDate } = {}) => {
    // 1) Filtrar por estado (obligatorio para evitar scan)
    const pkEstado = status || 'PENDING';           // default
    let   keyExpr  = '#s = :s';
    const names  = { '#s': 'estado' };
    const values = { ':s': pkEstado };
  
    // 2) Rango de fechas opcional
    if (startDate && endDate) {
      keyExpr += ' AND #t BETWEEN :d AND :h';
      Object.assign(names,  { '#t': 'timestamp' });
      Object.assign(values, { ':d': startDate, ':h': endDate });
    }
  
    const { Items } = await dynamoDB.query({
      TableName             : Tables.Issues,
      IndexName             : 'estado-timestamp-GSI',
      KeyConditionExpression: keyExpr,
      ExpressionAttributeNames : names,
      ExpressionAttributeValues: values,
      ScanIndexForward: false,                 // más recientes primero
    }).promise();
  
    return Items;
  };
  
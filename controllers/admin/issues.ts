// controllers/issues/index.ts
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import Issue from '../../models/Issue';
import SystemConfig from '../../models/SystemConfig';
import dbUtils from '../../utils/db';
import createApiResponse from '../../utils/response';
import { ApiResponse, IssueStatus } from '../../types';

const dynamoDB = new DocumentClient();

/* ------------------------------------------------------------------ */
/*  Tipos auxiliares                                                   */
/* ------------------------------------------------------------------ */

export interface GetIssuesOptions {
  status?: IssueStatus;
  /** ISO‑8601 o timestamp que tu backend entienda               */
  startDate?: string;
  endDate?: string;
}

export interface UpdateIssueInput {
  issueId: string;
  status: IssueStatus;
  resolution?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Implementación                                                    */
/* ------------------------------------------------------------------ */

/**
 * Obtiene la lista de incidencias con filtros opcionales.
 */
export async function getIssues(
  options: GetIssuesOptions = {},
): Promise<ApiResponse> {
  try {
    const filterExp: string[] = [];
    const exprVals: Record<string, unknown> = {};

    if (options.status) {
      filterExp.push('#status = :status');
      exprVals[':status'] = options.status;
    }
    if (options.startDate) {
      filterExp.push('timestamp >= :startDate');
      exprVals[':startDate'] = options.startDate;
    }
    if (options.endDate) {
      filterExp.push('timestamp <= :endDate');
      exprVals[':endDate'] = options.endDate;
    }

    const items = await dbUtils.scanItems(
      Issue.getTableName(),
      filterExp.length ? filterExp.join(' AND ') : undefined,
      Object.keys(exprVals).length ? exprVals : undefined,
      { '#status': 'status' }, // ExpressionAttributeNames
    );

    return createApiResponse(200, 'Issues retrieved successfully', items);
  } catch (err: any) {
    console.error('❌ Error al obtener problemas:', err);
    return createApiResponse(500, `Error al obtener problemas: ${err.message}`);
  }
}

/**
 * Actualiza el estado de una incidencia.
 */
export async function updateIssueStatus({
  issueId,
  status,
  resolution = null,
}: UpdateIssueInput): Promise<ApiResponse> {
  try {
    if (!Issue.isValidStatus(status)) {
      return createApiResponse(
        400,
        `Estado inválido. Debe ser ${Issue.getStatusValues().join(', ')}`,
      );
    }

    let updateExpr = 'SET #status = :status, lastUpdated = :ts';
    const exprNames = { '#status': 'status' };
    const exprVals: DocumentClient.ExpressionAttributeValueMap = {
      ':status': status,
      ':ts': new Date().toISOString(),
    };

    if (resolution && status === 'RESOLVED') {
      updateExpr += ', resolution = :resolution';
      exprVals[':resolution'] = resolution;
    }

    const updated = await dbUtils.updateItem(
      Issue.getTableName(),
      { IssueNumber: issueId },
      updateExpr,
      exprVals,
      exprNames,
    );

    if (!updated) {
      return createApiResponse(404, `No se encontró el issue ${issueId}`);
    }

    return createApiResponse(200, 'Issue status updated', updated);
  } catch (err: any) {
    console.error(`❌ Error actualizando issue ${issueId}:`, err);
    return createApiResponse(
      500,
      `Error al actualizar estado: ${err.message}`,
    );
  }
}

/**
 * Elimina una incidencia.
 */
export async function deleteIssue(
  issueId: string,
): Promise<ApiResponse> {
  try {
    if (!issueId) {
      return createApiResponse(400, 'ID de incidencia es requerido');
    }

    // Verifica existencia
    const existing = await dbUtils.getItem(Issue.getTableName(), {
      IssueNumber: issueId,
    });
    if (!existing) {
      return createApiResponse(404, `No se encontró la incidencia ${issueId}`);
    }

    // Elimina
    const deleted = await dbUtils.deleteItem(Issue.getTableName(), {
      IssueNumber: issueId,
    });

    // Registra en logs de administración
    await dbUtils.putItem(SystemConfig.getAdminLogsTable(), {
      operacion: 'DELETE_ISSUE',
      timestamp: new Date().toISOString(),
      issueId,
      deletedItem: deleted,
      usuario: 'ADMIN', // TODO: obtener del contexto auth
    });

    return createApiResponse(200, `Issue ${issueId} eliminado`, {
      deleted: true,
    });
  } catch (err: any) {
    console.error(`❌ Error eliminando issue ${issueId}:`, err);
    return createApiResponse(500, `Error al eliminar: ${err.message}`);
  }
}

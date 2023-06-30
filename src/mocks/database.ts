import { QueryResult, QueryResultRow } from "pg";

export const getMockQueryResult = (
  rowCount: number,
  rows?: QueryResultRow[]
): QueryResult => {
  return {
    rows: rows || [],
    rowCount,
    command: "",
    oid: 1,
    fields: [],
  };
};

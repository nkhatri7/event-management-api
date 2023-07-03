import { QueryResult, QueryResultRow } from "pg";

export const getMockQueryResult = (rows: QueryResultRow[]): QueryResult => {
  return {
    rows,
    rowCount: rows.length,
    command: "",
    oid: 1,
    fields: [],
  };
};

import { IQuery } from "../../interfaces/query.intrface"

export class MySQLSQLDriver implements IQuery {

  plainQuery(): string {
    return `
      select
        tb.table_name,
        tb.table_schema,
        JSON_ARRAYAGG(
          json_object(
            'column', cols.column_name,
            'columnLength', cols.character_maximum_length,
            'dataType', cols.data_type,
            -- 'dataTypeUdt', cols.udt_name,
            'isNulleable', cols.is_nullable,
            'isConstraint', cols.is_constraint,
            'constraintType', cols.constraint_type,
            'constraintDetail', cols.constraint_detail,
            'ordinalPosition', cols.ordinal_position,
            'defaultValue', cols.column_default,
            'isIndex', cols.is_index,
            'enumValues', case when cols.data_type = 'enum' then cols.column_type end
          )
        ) as table_columns
      from information_schema.tables tb
      left join(
        select
          cc.table_name,
          cc.table_schema,
          cc.column_name,
          cc.data_type,
          -- cc.udt_name,
          cc.character_maximum_length,
          cc.column_default,
          case when cc.is_nullable = 'YES' then true else false end as is_nullable,
          case when constraint_cols.constraint_type is not null then true else false end is_constraint,
          constraint_cols.constraint_type,
          -- case when constraint_cols.constraint_type = 'FOREIGN KEY' THEN
          json_object(
            'refTable', constraint_cols.foreign_table,
            'refId', constraint_cols.reference_fk_id,
            'schemaRef', constraint_cols.foreign_schema
          ) as constraint_detail,
            -- else null end as constraint_detail,
          case when idx.index_names is not null then true else false end as is_index,
          -- enum_tabs.labels as enum_tabs,
          cc.ordinal_position,
          cc.COLUMN_TYPE
        from information_schema.columns cc
        left join(
          select DISTINCT
            kcu.table_schema,
            kcu.table_name,
            kcu.column_name,
            tc.constraint_type,
            kcu.referenced_table_name as foreign_table,
            kcu.referenced_table_schema as foreign_schema,
            kcu.referenced_column_name as reference_fk_id
          from information_schema.key_column_usage kcu
          left join information_schema.table_constraints tc on tc.constraint_name = kcu.constraint_name
        ) as constraint_cols on constraint_cols.column_name = cc.column_name and constraint_cols.table_name = cc.table_name
        left join(
        SELECT
          s.table_name,
          table_schema,
          group_concat(s.index_name) as index_names,
          group_concat(s.column_name) as column_names
        FROM 		information_schema.statistics s
        WHERE		non_unique = 1
        GROUP BY
          1,2
        order by
            1,2
        ) as idx on idx.table_name = cc.table_name and cc.column_name IN (idx.column_names) and idx.table_schema = cc.table_schema
        order by
          cc.ordinal_position asc
      ) as cols on cols.table_name = tb.table_name and cols.table_schema = tb.table_schema
      where
        tb.table_schema not in('information_schema', 'sys', 'performance_schema', 'mysql')
        -- tb.table_schema = 'test_mysql'
      group by
        tb.table_name,
        tb.table_schema;
    `
  }
}

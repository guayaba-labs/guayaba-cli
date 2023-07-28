import { IQuery } from "../../interfaces/query.intrface"

export class PostgreSQLDriver implements IQuery {

  plainQuery(): string {
    return `
    select
      tb.table_name,
      tb.table_schema,
      json_agg(
        json_build_object(
          'column', cols.column_name,
          'columnLength', cols.character_maximum_length,
          'dataType', cols.data_type,
          'dataTypeUdt', cols.udt_name,
          'isNulleable', cols.is_nullable,
          'isConstraint', cols.is_constraint,
          'constraintType', cols.constraint_type,
          'constraintDetail', cols.constraint_detail,
          'ordinalPosition', cols.ordinal_position,
					'defaultValue', cols.column_default,
					'isIndex', cols.is_index,
					'enumValues', cols.enum_tabs
        )
      ) as table_columns
    from information_schema.tables tb
      left join(
        select
          cc.table_name,
					cc.table_schema,
          cc.column_name,
          cc.data_type,
          cc.udt_name,
          cc.character_maximum_length,
					cc.column_default,
          case when cc.is_nullable = 'YES' then true else false end as is_nullable,
          case when constraint_cols.constraint_type is not null then true else false end is_constraint,
          constraint_cols.constraint_type,
          case
            when constraint_cols.constraint_type = 'FOREIGN KEY' THEN
              json_build_object(
                'refTable', constraint_cols.foreign_table,
                'refId', constraint_cols.reference_fk_id,
                'schemaRef', constraint_cols.foreign_schema
              )
            ELSE
              NULL
          end constraint_detail,
					case when idx.index_names is not null then true else false end as is_index,
					enum_tabs.labels as enum_tabs,
          cc.ordinal_position
        from information_schema.columns cc
          left join(
            select
							kcu.table_schema,
              kcu.column_name,
              kcu.table_name,
              tc.constraint_type,
              ccu.table_name as foreign_table,
							ccu.table_schema as foreign_schema,
              ccu.column_name as reference_fk_id
            from information_schema.key_column_usage kcu
              left join information_schema.table_constraints tc on tc.constraint_name = kcu.constraint_name
              left join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name
          ) as constraint_cols on constraint_cols.column_name = cc.column_name and constraint_cols.table_name = cc.table_name
		  left join(
			select
				t.relname as table_name,
				array_agg(i.relname) as index_names,
				array_agg(a.attname) as column_names
			from
				pg_class t,
				pg_class i,
				pg_index ix,
				pg_attribute a
			where
				t.oid = ix.indrelid
				and i.oid = ix.indexrelid
				and a.attrelid = t.oid
				and a.attnum = ANY(ix.indkey)
				and t.relkind = 'r'
			group by
				t.relname
			order by
				t.relname
		  ) as idx on idx.table_name = cc.table_name and cc.column_name = ANY(idx.column_names)
			left join (
				SELECT
					t.typname,
					array_agg(e.enumlabel) as labels
				FROM pg_enum e
					JOIN pg_type t ON e.enumtypid = t.oid
					-- WHERE t.typname = 'gender_enum'
				group by
					t.typname
			) as enum_tabs on enum_tabs.typname = cc.udt_name
        order by
          cc.ordinal_position asc
      ) as cols on cols.table_name = tb.table_name and cols.table_schema = tb.table_schema
    where
      tb.table_schema not in('information_schema', 'pg_catalog')
    group by
      tb.table_name,
      tb.table_schema;
    `
  }
}
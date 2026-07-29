# Base de datos - Vivace Suite (SGECV)

Esta carpeta contiene todos los scripts SQL utilizados para construir y mantener la base de datos del proyecto.

## Organización

Cada módulo del sistema tendrá su propia carpeta.

database/
├── members/
├── rehearsals/
├── attendance/
├── repertoire/
├── fees/
├── trips/
├── reports/
└── seeds/

## Convención de nombres

Los archivos SQL utilizarán el siguiente formato:

01_create_table_name.sql
02_alter_table_name.sql
03_create_indexes.sql
04_create_rls.sql
05_seed_data.sql

## Reglas

- Un cambio importante por archivo.
- Nunca modificar un script ya ejecutado en producción.
- Los cambios posteriores deberán realizarse mediante nuevos scripts.
- Todos los scripts deberán almacenarse en Git.

## Orden de ejecución

1. Tablas
2. Relaciones
3. Índices
4. Restricciones
5. Políticas RLS
6. Datos iniciales (Seeds)

## Objetivo

Mantener una base de datos versionada, reproducible y fácil de mantener.
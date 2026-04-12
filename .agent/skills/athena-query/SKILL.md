---
name: athena-query
description: Run SQL queries on Amazon Athena, list databases/tables, and retrieve formatted results.
trigger:
  - When the user asks to run a query on Athena
  - When the user asks to query data in AWS
  - When the user asks to list Athena databases or tables
  - When the user asks to explore or describe Athena table schemas
  - When the user mentions Athena, SQL on AWS, or data lake queries
---

# Athena Query Skill

Run SQL queries against Amazon Athena, explore databases/tables, and return formatted results using the helper script.

## Prerequisites

1. **AWS Credentials**: Must be configured via one of:
   - Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)
   - AWS CLI profile (`~/.aws/credentials`)
   - IAM role (if running on EC2/Lambda/ECS)

2. **IAM Permissions**: The identity needs at minimum:
   - `athena:StartQueryExecution`
   - `athena:GetQueryExecution`
   - `athena:GetQueryResults`
   - `athena:ListDatabases`
   - `athena:ListTableMetadata`
   - `athena:GetTableMetadata`
   - `s3:PutObject`, `s3:GetObject` on the query results bucket
   - `glue:GetDatabase`, `glue:GetDatabases`, `glue:GetTable`, `glue:GetTables` (if using Glue catalog)

3. **Python Dependencies**: Install before first use:
   ```bash
   pip install -r <skill_dir>/scripts/requirements.txt
   ```

## Configuration

Set these environment variables (or pass as CLI arguments):

| Variable | CLI Flag | Description | Required |
|---|---|---|---|
| `ATHENA_OUTPUT_LOCATION` | `--output-location` | S3 path for query results (e.g., `s3://my-bucket/athena-results/`) | **Yes** |
| `AWS_DEFAULT_REGION` | `--region` | AWS region (e.g., `us-east-1`) | No (defaults to `us-east-1`) |
| `ATHENA_ENDPOINT_URL` | `--endpoint-url` | VPC endpoint URL for Athena | No (uses public endpoint if omitted) |
| `ATHENA_WORKGROUP` | `--workgroup` | Athena workgroup name | No (defaults to `primary`) |
| `ATHENA_CATALOG` | `--catalog` | Data catalog name | No (defaults to `AwsDataCatalog`) |
| `ATHENA_DATABASE` | `--database` | Default database name | No |

### Corporate / VPC Endpoint Setup

In corporate environments where direct internet access is restricted, you need a **VPC endpoint** for Athena (`com.amazonaws.<region>.athena`). Once your infra team provisions the endpoint, pass its DNS name via `--endpoint-url` or the `ATHENA_ENDPOINT_URL` env var:

```bash
# Via CLI flag
<skill_dir>\scripts\run_query.bat --list-databases \
  --endpoint-url https://vpce-0abc123def456.athena.us-east-1.vpce.amazonaws.com

# Or set it once as an env var
export ATHENA_ENDPOINT_URL=https://vpce-0abc123def456.athena.us-east-1.vpce.amazonaws.com
<skill_dir>\scripts\run_query.bat --list-databases
```

If no endpoint URL is provided, the script uses the standard public Athena endpoint.

## Workflow

### Step 1: Install Dependencies (first time only)
```bash
pip install -r <skill_dir>/scripts/requirements.txt
```

### Step 2: Run Queries

Use the helper batch script `scripts\run_query.bat` for all Athena operations. This script automatically handles AWS authentication before running the query.

#### Run a SQL Query
```bash
<skill_dir>\scripts\run_query.bat \
  --query "SELECT * FROM my_table LIMIT 10" \
  --database my_database \
  --output-location s3://my-bucket/athena-results/ \
  --region us-east-1
```

#### List Databases
```bash
<skill_dir>\scripts\run_query.bat --list-databases \
  --region us-east-1
```

#### List Tables in a Database
```bash
<skill_dir>\scripts\run_query.bat --list-tables \
  --database my_database \
  --region us-east-1
```

#### Describe a Table
```bash
<skill_dir>\scripts\run_query.bat --describe-table my_table \
  --database my_database \
  --region us-east-1
```

### Step 3: Format and Present Results

The script outputs results in either **table** (default) or **JSON** format. Use `--format json` for JSON output. Present the results to the user in a clean, readable format.

## CLI Reference

```
run_query.bat [OPTIONS]


Options:
  --query TEXT              SQL query to execute
  --database TEXT           Athena database name
  --output-location TEXT    S3 path for query results (required for queries)
  --region TEXT             AWS region (default: us-east-1)
  --endpoint-url TEXT       VPC endpoint URL for Athena (for corporate/VPC setups)
  --workgroup TEXT          Athena workgroup (default: primary)
  --catalog TEXT            Data catalog (default: AwsDataCatalog)
  --max-wait INT            Max seconds to wait for query (default: 300)
  --format [table|json]     Output format (default: table)
  --list-databases          List all databases in the catalog
  --list-tables             List all tables in the specified database
  --describe-table TEXT     Describe the schema of a table
  --help                    Show help message
```

## Error Handling

| Error | Cause | Resolution |
|---|---|---|
| `AccessDeniedException` | Missing IAM permissions | Add required permissions listed above |
| `InvalidRequestException` | SQL syntax error or bad database/table name | Fix the query syntax or verify names with `--list-databases` / `--list-tables` |
| `Query timed out` | Query exceeded `--max-wait` | Increase `--max-wait` or optimize the query |
| `NoCredentialsError` | No AWS credentials found | Configure credentials via env vars, CLI profile, or IAM role |
| `Output location required` | Missing `--output-location` | Provide the S3 path or set `ATHENA_OUTPUT_LOCATION` env var |

## Tips

- Use `LIMIT` clauses to avoid pulling massive result sets.
- For large datasets, consider using `--format json` and saving results to a file.
- The `--describe-table` command is useful before writing queries to understand column names and types.
- If a workgroup has a default output location configured, `--output-location` can be omitted.

# Testing with LocalStack

This guide provides instructions for using LocalStack to test the Lambda Lomas Altas application locally.

## Prerequisites

- Docker
- AWS CLI
- LocalStack CLI (`pip install localstack`)
- AWS SAM CLI

## Setting up LocalStack

1. Start LocalStack:

```bash
localstack start
```

2. Configure AWS CLI to use LocalStack:

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

3. Set the LocalStack endpoint:

```bash
export LOCALSTACK_ENDPOINT=http://localhost:4566
```

## Deploying to LocalStack

1. Use SAM CLI to deploy the application to LocalStack:

```bash
sam build
sam deploy --stack-name huevos-app --local-api-gateway --region us-east-1 --endpoint-url http://localhost:4566
```

2. Create DynamoDB tables:

```bash
aws dynamodb create-table \
  --table-name Boxes \
  --attribute-definitions AttributeName=codigo,AttributeType=S AttributeName=ubicacion,AttributeType=S \
  --key-schema AttributeName=codigo,KeyType=HASH \
  --global-secondary-indexes 'IndexName=ubicacion-index,KeySchema=[{AttributeName=ubicacion,KeyType=HASH}],Projection={ProjectionType=ALL}' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $LOCALSTACK_ENDPOINT

aws dynamodb create-table \
  --table-name Pallets \
  --attribute-definitions AttributeName=codigo,AttributeType=S \
  --key-schema AttributeName=codigo,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $LOCALSTACK_ENDPOINT

aws dynamodb create-table \
  --table-name Issues \
  --attribute-definitions AttributeName=IssueNumber,AttributeType=S \
  --key-schema AttributeName=IssueNumber,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $LOCALSTACK_ENDPOINT

aws dynamodb create-table \
  --table-name SystemConfig \
  --attribute-definitions AttributeName=key,AttributeType=S \
  --key-schema AttributeName=key,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $LOCALSTACK_ENDPOINT
```

## Testing Lambda Functions

1. Test the movePallet lambda function:

```bash
aws lambda invoke \
  --function-name HuevosFunction \
  --payload file://events/movePallet.json \
  --endpoint-url $LOCALSTACK_ENDPOINT \
  output.json

cat output.json
```

2. Test API Gateway endpoints:

```bash
# Get all boxes
curl -X GET http://localhost:4566/restapis/*/prod/production

# Move a pallet
curl -X POST http://localhost:4566/restapis/*/prod/movePallet \
  -H "Content-Type: application/json" \
  -d '{"codigo":"PALLET12345","ubicacion":"BODEGA"}'
```

## Viewing DynamoDB Data

```bash
# List tables
aws dynamodb list-tables --endpoint-url $LOCALSTACK_ENDPOINT

# Scan a table
aws dynamodb scan --table-name Boxes --endpoint-url $LOCALSTACK_ENDPOINT
```

## Cleanup

```bash
# Delete tables
aws dynamodb delete-table --table-name Boxes --endpoint-url $LOCALSTACK_ENDPOINT
aws dynamodb delete-table --table-name Pallets --endpoint-url $LOCALSTACK_ENDPOINT
aws dynamodb delete-table --table-name Issues --endpoint-url $LOCALSTACK_ENDPOINT
aws dynamodb delete-table --table-name SystemConfig --endpoint-url $LOCALSTACK_ENDPOINT

# Delete stack
aws cloudformation delete-stack --stack-name huevos-app --endpoint-url $LOCALSTACK_ENDPOINT
```

## Troubleshooting

If you encounter any issues, try the following:

1. Restart LocalStack:
```bash
localstack stop
localstack start
```

2. Check LocalStack logs:
```bash
docker logs localstack
```

3. Verify your tables were created:
```bash
aws dynamodb list-tables --endpoint-url $LOCALSTACK_ENDPOINT
``` 
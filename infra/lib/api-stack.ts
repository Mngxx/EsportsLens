import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib/core";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "node:path";
import type { Construct } from "constructs";

export interface ApiStackProps extends cdk.StackProps {
  athenaResultsBucket: s3.Bucket;
  curatedBucket: s3.Bucket;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const apiFunction = new PythonFunction(this, "apiFunction", {
      entry: path.join(__dirname, "../../api/src"),
      runtime: lambda.Runtime.PYTHON_3_12,
      index: "main.py",
      handler: "handler",
      environment: {
        ATHENA_DATABASE,
        ATHENA_WORKGROUP,
        ATHENA_OUTPUT_LOCATION,
      },
    });

    props.athenaResultsBucket.grantReadWrite(apiFunction);
    props.curatedBucket.grantRead(apiFunction);

    const athenaPolicy = new iam.PolicyStatement({
      actions: [
        "athena:StartQueryExecution",
        "athena:GetQueryExecution",
        "athena:GetQueryResults",
        "athena:GetWorkGroup",
      ],
      resources: [
        `arn:aws:athena:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:workgroup/esportslens-workgroup`,
      ],
    });
    const gluePolicy = new iam.PolicyStatement({
      actions: [
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetDatabase",
        "glue:GetPartitions",
      ],
      resources: [
        `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:catalog`,
        `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:database/esportslens_db`,
      ],
    });

    apiFunction.addToRolePolicy(gluePolicy);
    apiFunction.addToRolePolicy(athenaPolicy);
  }
}

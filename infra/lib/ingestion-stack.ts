import * as path from "node:path";

import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface IngestionStackProps extends cdk.StackProps {
	rawBucket: s3.Bucket;
}

export class IngestionStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: IngestionStackProps) {
		super(scope, id, props);

		// Without an explicit LogGroup, Lambda auto-creates one with
		// indefinite retention — set a bound explicitly instead.
		const ingestionLogGroup = new logs.LogGroup(this, "ingestionLogGroup", {
			retention: logs.RetentionDays.ONE_MONTH,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		// RIOT_API_KEY is fetched from SSM at runtime, refreshed via `aws ssm put-parameter`.
		const riotApiKeyParam =
			ssm.StringParameter.fromSecureStringParameterAttributes(
				this,
				"riotApiKeyParam",
				{ parameterName: "/esportslens/riot-api-key" },
			);

		const ingestionFunction = new PythonFunction(this, "ingestionFunction", {
			entry: path.join(__dirname, "../../ingestion/src"),
			runtime: lambda.Runtime.PYTHON_3_12,
			index: "handler.py",
			handler: "lambda_handler",
			timeout: cdk.Duration.minutes(5),
			memorySize: 512,
			environment: {
				RAW_BUCKET_NAME: props.rawBucket.bucketName,
				RIOT_API_KEY_PARAM_NAME: riotApiKeyParam.parameterName,
			},
			logGroup: ingestionLogGroup,
		});

		props.rawBucket.grantWrite(ingestionFunction);
		riotApiKeyParam.grantRead(ingestionFunction);

		const schedule = new events.Rule(this, "ingestionSchedule", {
			schedule: events.Schedule.rate(cdk.Duration.hours(12)),
		});
		schedule.addTarget(new targets.LambdaFunction(ingestionFunction));

		// No SNS action — just a visible ALARM state in the console for now.
		new cloudwatch.Alarm(this, "ingestionErrorsAlarm", {
			metric: ingestionFunction.metricErrors({
				period: cdk.Duration.hours(12),
			}),
			threshold: 1,
			evaluationPeriods: 1,
			comparisonOperator:
				cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
		});
	}
}

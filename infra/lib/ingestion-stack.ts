import * as path from "node:path";

import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface IngestionStackProps extends cdk.StackProps {
	rawBucket: s3.Bucket;
}

export class IngestionStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: IngestionStackProps) {
		super(scope, id, props);

		// CDK synthesizes every stack regardless of deploy target, so a hard
		// throw here used to break unrelated stacks too — warn instead.
		if (!process.env.RIOT_API_KEY) {
			console.warn(
				"WARNING: RIOT_API_KEY is not set (check ingestion/.env) — " +
					"IngestionStack will synthesize with an empty key. The " +
					"ingestion Lambda will fail at runtime until this is set " +
					"and the stack is redeployed.",
			);
		}

		// Without an explicit LogGroup, Lambda auto-creates one with
		// indefinite retention — set a bound explicitly instead.
		const ingestionLogGroup = new logs.LogGroup(this, "ingestionLogGroup", {
			retention: logs.RetentionDays.ONE_MONTH,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const ingestionFunction = new PythonFunction(this, "ingestionFunction", {
			entry: path.join(__dirname, "../../ingestion/src"),
			runtime: lambda.Runtime.PYTHON_3_12,
			index: "handler.py",
			handler: "lambda_handler",
			timeout: cdk.Duration.minutes(5),
			memorySize: 512,
			environment: {
				RAW_BUCKET_NAME: props.rawBucket.bucketName,
				RIOT_API_KEY: process.env.RIOT_API_KEY ?? "",
			},
			logGroup: ingestionLogGroup,
		});

		props.rawBucket.grantWrite(ingestionFunction);

		const schedule = new events.Rule(this, "ingestionSchedule", {
			schedule: events.Schedule.rate(cdk.Duration.hours(6)),
		});
		schedule.addTarget(new targets.LambdaFunction(ingestionFunction));
	}
}

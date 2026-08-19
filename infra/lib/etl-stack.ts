import type * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface EtlStackProps extends cdk.StackProps {
	rawBucket: s3.Bucket;
	curatedBucket: s3.Bucket;
}

export class EtlStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: EtlStackProps) {
		super(scope, id, props);
	}
}

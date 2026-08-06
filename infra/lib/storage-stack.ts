import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export class StorageStack extends cdk.Stack {
	public readonly rawBucket: s3.Bucket;
	public readonly curatedBucket: s3.Bucket;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const bucketSecurityConfig = {
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			encryption: s3.BucketEncryption.S3_MANAGED,
		};

		// Create the first bucket
		this.rawBucket = new s3.Bucket(this, "rawBucket", {
			bucketName: `esportslens-raw-${cdk.Aws.ACCOUNT_ID}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			versioned: true,
			...bucketSecurityConfig,
		});

		// Create the second bucket
		this.curatedBucket = new s3.Bucket(this, "curatedBucket", {
			bucketName: `esportslens-curated-${cdk.Aws.ACCOUNT_ID}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			versioned: true,
			...bucketSecurityConfig,
		});
	}
}

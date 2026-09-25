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
			lifecycleRules: [
				{
					// versioned:true with no prior lifecycle kept every old
					// version forever — was a silent, unbounded cost driver.
					id: "expire-noncurrent-versions",
					noncurrentVersionExpiration: cdk.Duration.days(14),
				},
				{
					// Raw matches are ETL staging only, safe to expire once
					// curated has ingested them.
					id: "expire-old-raw-matches",
					prefix: "dota2/matches/",
					expiration: cdk.Duration.days(60),
				},
				{
					id: "expire-old-raw-lol-matches",
					prefix: "league_of_legends/matches/",
					expiration: cdk.Duration.days(60),
				},
			],
		});

		// Create the second bucket
		this.curatedBucket = new s3.Bucket(this, "curatedBucket", {
			bucketName: `esportslens-curated-${cdk.Aws.ACCOUNT_ID}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			versioned: true,
			...bucketSecurityConfig,
			lifecycleRules: [
				{
					// No object expiration — curated is actively served by
					// Athena, unlike raw. Just clean up old versions.
					id: "expire-noncurrent-versions",
					noncurrentVersionExpiration: cdk.Duration.days(14),
				},
			],
		});
	}
}

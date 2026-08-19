import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as iam from "aws-cdk-lib/aws-iam";
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

		//Glue Database
		const database = new glue_alpha.Database(this, "EsportsLensDatabase", {
			databaseName: "esportslens_db",
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		//IAM role shared by both Glue jobs
		const glueJobRole = new iam.Role(this, "GlueJobRole", {
			assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
			managedPolicies: [
				iam.ManagedPolicy.fromAwsManagedPolicyName(
					"service-role/AWSGlueServiceRole",
				),
			],
		});

		props.rawBucket.grantRead(glueJobRole);
		props.curatedBucket.grantReadWrite(glueJobRole);
	}
}

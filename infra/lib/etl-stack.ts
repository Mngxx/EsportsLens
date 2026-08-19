import * as path from "node:path";

import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as glue from "aws-cdk-lib/aws-glue";
import * as iam from "aws-cdk-lib/aws-iam";
import type * as s3 from "aws-cdk-lib/aws-s3";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
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
		const etlDir = path.join(__dirname, "../../etl");

		const etlPackageAsset = new Asset(this, "EtlPackageAsset", {
			path: etlDir, // zips etl/ as a whole, so utils/ and jobs/ land at the right relative paths
		});
		etlPackageAsset.grantRead(glueJobRole);

		const dota2ScriptAsset = new Asset(this, "Dota2ScriptAsset", {
			path: path.join(etlDir, "jobs/dota2_transform.py"), // single file — uploaded as-is, not zipped
		});
		new glue.CfnJob(this, "Dota2TransformJob", {
			name: "dota2-transform",
			role: glueJobRole.roleArn,
			glueVersion: "4.0",
			workerType: "G.1X",
			numberOfWorkers: 2,
			command: {
				name: "glueetl",
				pythonVersion: "3",
				scriptLocation: dota2ScriptAsset.s3ObjectUrl,
			},
			defaultArguments: {
				"--RAW_BUCKET": props.rawBucket.bucketName,
				"--CURATED_BUCKET": props.curatedBucket.bucketName,
				"--extra-py-files": etlPackageAsset.s3ObjectUrl,
			},
		});
		dota2ScriptAsset.grantRead(glueJobRole);

		const lolScriptAsset = new Asset(this, "LolScriptAsset", {
			path: path.join(etlDir, "jobs/league_of_legends_transform.py"),
		});

		new glue.CfnJob(this, "LeagueOfLegendsTransformJob", {
			name: "league-of-legends-transform",
			role: glueJobRole.roleArn,
			glueVersion: "4.0",
			workerType: "G.1X",
			numberOfWorkers: 2,
			command: {
				name: "glueetl",
				pythonVersion: "3",
				scriptLocation: lolScriptAsset.s3ObjectUrl,
			},
			defaultArguments: {
				"--RAW_BUCKET": props.rawBucket.bucketName,
				"--CURATED_BUCKET": props.curatedBucket.bucketName,
				"--extra-py-files": etlPackageAsset.s3ObjectUrl,
			},
		});
		lolScriptAsset.grantRead(glueJobRole);

		new glue.CfnCrawler(this, "CuratedCrawler", {
			name: "esportslens-curated-crawler",
			role: glueJobRole.roleArn,
			databaseName: database.databaseName,
			targets: {
				s3Targets: [
					{ path: `s3://${props.curatedBucket.bucketName}/dota2/matches/` },
					{ path: `s3://${props.curatedBucket.bucketName}/dota2/heroes/` },
					{ path: `s3://${props.curatedBucket.bucketName}/dota2/hero_stats/` },
					{
						path: `s3://${props.curatedBucket.bucketName}/league_of_legends/matches/`,
					},
					{
						path: `s3://${props.curatedBucket.bucketName}/league_of_legends/champions/`,
					},
					{
						path: `s3://${props.curatedBucket.bucketName}/league_of_legends/champion_stats/`,
					},
				],
			},
		});
	}
}

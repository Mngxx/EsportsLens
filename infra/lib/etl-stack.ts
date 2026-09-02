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
  public readonly database: glue_alpha.Database;

  constructor(scope: Construct, id: string, props: EtlStackProps) {
    super(scope, id, props);

    //Glue Database
    this.database = new glue_alpha.Database(this, "EsportsLensDatabase", {
      databaseName: "esportslens_db",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const database = this.database;

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

    new glue.CfnCrawler(this, "Dota2CuratedCrawler", {
      name: "esportslens-dota2-curated-crawler",
      role: glueJobRole.roleArn,
      databaseName: database.databaseName,
      tablePrefix: "dota2_",
      targets: {
        s3Targets: [
          { path: `s3://${props.curatedBucket.bucketName}/dota2/heroes/` },
          { path: `s3://${props.curatedBucket.bucketName}/dota2/hero_stats/` },
        ],
      },
    });

    new glue.CfnCrawler(this, "LeagueOfLegendsCuratedCrawler", {
      name: "esportslens-league-of-legends-curated-crawler",
      role: glueJobRole.roleArn,
      databaseName: database.databaseName,
      tablePrefix: "league_of_legends_",
      targets: {
        s3Targets: [
          {
            path: `s3://${props.curatedBucket.bucketName}/league_of_legends/champions/`,
          },
          {
            path: `s3://${props.curatedBucket.bucketName}/league_of_legends/champion_stats/`,
          },
        ],
      },
    });

    new glue_alpha.S3Table(this, "Dota2MatchesTable", {
      database,
      tableName: "dota2_matches",
      bucket: props.curatedBucket,
      s3Prefix: "dota2/matches/",
      dataFormat: glue_alpha.DataFormat.PARQUET,
      columns: [
        { name: "match_id", type: glue_alpha.Schema.BIG_INT },
        { name: "account_id", type: glue_alpha.Schema.BIG_INT },
        { name: "player_name", type: glue_alpha.Schema.STRING },
        { name: "hero_id", type: glue_alpha.Schema.BIG_INT },
        { name: "team", type: glue_alpha.Schema.STRING },
        { name: "win", type: glue_alpha.Schema.BOOLEAN },
        { name: "kills", type: glue_alpha.Schema.BIG_INT },
        { name: "deaths", type: glue_alpha.Schema.BIG_INT },
        { name: "assists", type: glue_alpha.Schema.BIG_INT },
        { name: "kda", type: glue_alpha.Schema.DOUBLE },
        { name: "last_hits", type: glue_alpha.Schema.BIG_INT },
        { name: "denies", type: glue_alpha.Schema.BIG_INT },
        { name: "gold_per_min", type: glue_alpha.Schema.BIG_INT },
        { name: "xp_per_min", type: glue_alpha.Schema.BIG_INT },
        { name: "net_worth", type: glue_alpha.Schema.BIG_INT },
        { name: "hero_damage", type: glue_alpha.Schema.BIG_INT },
        { name: "tower_damage", type: glue_alpha.Schema.BIG_INT },
        { name: "hero_healing", type: glue_alpha.Schema.BIG_INT },
        { name: "level", type: glue_alpha.Schema.BIG_INT },
        { name: "league_id", type: glue_alpha.Schema.BIG_INT },
        { name: "duration_secs", type: glue_alpha.Schema.BIG_INT },
        { name: "match_date", type: glue_alpha.Schema.TIMESTAMP },
      ],
      partitionKeys: [
        { name: "year", type: glue_alpha.Schema.INTEGER },
        { name: "month", type: glue_alpha.Schema.INTEGER },
      ],
      partitionProjection: {
        year: glue_alpha.PartitionProjectionConfiguration.integer({
          min: 2026,
          max: 2030,
        }),
        month: glue_alpha.PartitionProjectionConfiguration.integer({
          min: 1,
          max: 12,
        }),
      },
    });

    new glue_alpha.S3Table(this, "LeagueOfLegendsMatchesTable", {
      database,
      tableName: "league_of_legends_matches",
      bucket: props.curatedBucket,
      s3Prefix: "league_of_legends/matches/",
      dataFormat: glue_alpha.DataFormat.PARQUET,
      columns: [
        { name: "match_id", type: glue_alpha.Schema.STRING },
        { name: "puuid", type: glue_alpha.Schema.STRING },
        { name: "player_name", type: glue_alpha.Schema.STRING },
        { name: "champion_id", type: glue_alpha.Schema.BIG_INT },
        { name: "champion_name", type: glue_alpha.Schema.STRING },
        { name: "team_id", type: glue_alpha.Schema.BIG_INT },
        { name: "win", type: glue_alpha.Schema.BOOLEAN },
        { name: "kills", type: glue_alpha.Schema.BIG_INT },
        { name: "deaths", type: glue_alpha.Schema.BIG_INT },
        { name: "assists", type: glue_alpha.Schema.BIG_INT },
        { name: "gold_earned", type: glue_alpha.Schema.BIG_INT },
        { name: "damage_to_champions", type: glue_alpha.Schema.BIG_INT },
        { name: "cs", type: glue_alpha.Schema.BIG_INT },
        { name: "vision_score", type: glue_alpha.Schema.BIG_INT },
        { name: "champ_level", type: glue_alpha.Schema.BIG_INT },
        { name: "queue_id", type: glue_alpha.Schema.BIG_INT },
        { name: "duration_secs", type: glue_alpha.Schema.BIG_INT },
        { name: "match_date", type: glue_alpha.Schema.TIMESTAMP },
      ],
      partitionKeys: [
        { name: "year", type: glue_alpha.Schema.INTEGER },
        { name: "month", type: glue_alpha.Schema.INTEGER },
      ],
      partitionProjection: {
        year: glue_alpha.PartitionProjectionConfiguration.integer({
          min: 2026,
          max: 2030,
        }),
        month: glue_alpha.PartitionProjectionConfiguration.integer({
          min: 1,
          max: 12,
        }),
      },
    });
  }
}

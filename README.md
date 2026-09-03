# EsportsLens

> **Status: Weeks 1–3 Complete — Ingestion, ETL, Athena, and the API Live in Production**
> Infrastructure, ingestion (S3 data lake + scheduled Lambda), ETL (Glue PySpark jobs → curated Parquet), querying (Athena, with partition projection), and the FastAPI backend (Lambda + API Gateway, 9 endpoints across players/matches/meta) are deployed and verified end-to-end against real data. Frontend is not yet built.

A player and match stats platform (tracker.gg-style) that ingests match data from public game APIs, processes it through an AWS data pipeline, and surfaces player performance, ladder standings, and match insights through a public REST API and interactive dashboard.

**Dota 2** (via OpenDota, fully public API) is the primary game — real professional match data, no key required. **League of Legends** (Riot Games API) is secondary, tracking the Challenger ranked ladder rather than tournament matches, since Riot's official API has no tournament data for any third party. Valorant support is on hold — Riot restricts Valorant match-data API access to approved production keys, unlike League of Legends' match API, which works fine with a free personal key.

---

## Motivation

Built as a hands-on portfolio project to learn AWS data engineering end-to-end — serverless ingestion, ETL, data lakes, and SQL-on-S3 querying — with each AWS service chosen to map onto a domain of the AWS Certified Data Engineer – Associate exam, not just to make something that works.

---

## How It Works

1. An AWS Lambda function fetches pro match data (Dota 2, via OpenDota) and Challenger ladder match data (League of Legends, via Riot's API) on a 6-hour EventBridge schedule
2. Raw JSON lands in an S3 data lake, partitioned by game / year / month / day
3. AWS Glue (PySpark) transforms the raw JSON into cleaned, typed, partitioned Parquet
4. AWS Athena runs SQL directly over the curated Parquet data — no database to manage
5. A FastAPI backend (deployed on Lambda) queries Athena and serves results as JSON over REST
6. A React dashboard visualizes player stats, match history, and hero/agent meta trends (pick rate vs. win rate)

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Ingestion | AWS Lambda (Python 3.12) | Triggered by EventBridge every 6 hours |
| Data Lake | Amazon S3 | Raw (JSON) + curated (Parquet) buckets, private, SSE-encrypted |
| ETL | AWS Glue (PySpark) | Raw JSON → typed, partitioned Parquet |
| Query Engine | AWS Athena | Serverless SQL over S3, partition projection for cost control |
| Infrastructure | AWS CDK (TypeScript) | All AWS resources defined as code |
| API | FastAPI + Mangum | Deployed on Lambda behind API Gateway |
| Frontend | React 19 + Vite + TypeScript | Tailwind CSS v4, Recharts for visualizations |
| Frontend Hosting | Vercel | Auto-deploy on push |
| CI/CD | GitHub Actions | Path-triggered — each folder deploys independently |
| Testing | pytest (ingestion/API), Vitest (frontend) | |

**Data sources:** [OpenDota API](https://www.opendota.com) (Dota 2 pro matches — fully public, no key required), [Riot Games API](https://developer.riotgames.com) (League of Legends Challenger ladder — free personal key), [Data Dragon](https://developer.riotgames.com/docs/lol) (LoL champion static data — separate host, no auth)

---

## Project Structure

```
EsportsLens/
├── ingestion/    # AWS Lambda — fetches from Riot/OpenDota, writes raw JSON to S3
├── etl/          # AWS Glue PySpark jobs — raw JSON → curated Parquet
├── api/          # FastAPI backend — queries Athena, serves REST JSON
├── client/       # React + Vite + TypeScript dashboard
├── infra/        # AWS CDK — all AWS resources as code
└── .github/
    └── workflows/    # CI/CD, one workflow per folder, path-triggered
```

---

## Getting Started (Local Development)

Ingestion, ETL, Athena, and the API are live end-to-end; the frontend isn't built yet, so this covers deploying/testing the pipeline through the API layer.

**Prerequisites:** AWS account with CLI configured (`aws configure`), Node.js 20+, Python 3.12, Docker Desktop (required for CDK's Lambda dependency bundling, and for local PySpark development via AWS's official `aws-glue-libs` image — there's no supported way to run real PySpark locally without it), a free [Riot Games dev API key](https://developer.riotgames.com) (expires every 24h — a production key requires app approval)

```bash
# Deploy the data lake + ingestion Lambda + EventBridge schedule + Glue ETL jobs + Athena workgroup
cd infra
npm install
npx cdk deploy --all
```

```bash
# Run the ingestion tests locally
cd ingestion
python -m venv venv
venv\Scripts\activate        # Windows; source venv/bin/activate on macOS/Linux
pip install -r requirements-dev.txt
pytest
```

```bash
# Run the ETL (PySpark) tests locally — needs a JVM, so tests run inside AWS's official Glue container
docker run -it --rm -v "<path-to-repo>:/home/glue_user/workspace" public.ecr.aws/glue/aws-glue-libs:glue_libs_4.0.0_image_01
cd /home/glue_user/workspace/etl
python3 -m pytest -v
```

```bash
# Run the API tests locally (Athena mocked, no AWS credentials required)
cd api
python -m venv venv
venv\Scripts\activate        # Windows; source venv/bin/activate on macOS/Linux
pip install -r requirements-dev.txt
pytest
```

```bash
# Run the API locally against real Athena data
# needs api/.env with ATHENA_DATABASE, ATHENA_WORKGROUP, ATHENA_OUTPUT_LOCATION, AWS_REGION
# run from api/src (not api/) — source files use bare imports to match the flattened
# layout CDK's PythonFunction actually deploys to Lambda, so this needs to be the CWD
cd api/src
uvicorn main:app --reload
# then open http://localhost:8000/docs for interactive Swagger UI
```

---

## Roadmap

### Week 1 — Foundation & Ingestion ✅ Complete
- [x] AWS CDK project scaffolded
- [x] S3 data lake deployed (raw + curated buckets, encrypted, private)
- [x] Ingestion Lambda (Dota 2 + League of Legends fetchers, full test coverage)
- [x] EventBridge cron schedule (every 6 hours) — deployed and verified writing real data to S3

### Week 2 — ETL & Athena ✅ Complete
- [x] Glue PySpark transform jobs (raw JSON → curated Parquet) — two jobs covering all six curated tables across both games
- [x] Glue Catalog tables — crawler-discovered reference tables (heroes, hero stats, champions, champion stats) + explicitly-defined, partition-projected match tables
- [x] Athena workgroup deployed via CDK — verified with real queries returning correct data end-to-end, not just a successful deploy

### Week 3 — API Layer ✅ Complete
- [x] FastAPI routes — players, matches, meta (9 endpoints across both games, plus health check)
- [x] Lambda deployment via Mangum + API Gateway (HTTP API, catch-all integration) — deployed via CDK `ApiStack`
- [x] pytest coverage with mocked Athena responses (32 tests: happy path, empty results, Athena failures, input-validation/injection-guard cases)
- [x] CORS middleware (localhost + Vercel preview domains) and a GitHub Actions deploy workflow

### Week 4 — Frontend Dashboard
- [ ] React dashboard — Dashboard, Players, Matches, Meta pages
- [ ] Deployed on Vercel, connected to the live API

### Week 5 — CI/CD, Testing & Polish
- [ ] Full test coverage across ingestion, API, and frontend
- [ ] CloudWatch monitoring and alarms
- [ ] Dark mode, responsive layout, performance pass

### Week 6 — Documentation & Portfolio Integration
- [ ] Architecture diagram and demo walkthrough
- [ ] Portfolio site integration

---

_Personal project — built as a hands-on learning exercise in AWS data engineering, not intended for public production use._

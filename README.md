# EsportsLens

> **Status: Planning Complete — Build In Progress (Week 1: Foundation & Ingestion)**
> Infrastructure (S3 data lake) is deployed. Ingestion, ETL, API, and frontend are not yet built.

An esports analytics platform that ingests live and historical match data from public game APIs, processes it through an AWS data pipeline, and surfaces player and match insights through a public REST API and interactive dashboard.

---

## Motivation

Built as a hands-on portfolio project to learn AWS data engineering end-to-end — serverless ingestion, ETL, data lakes, and SQL-on-S3 querying — with each AWS service chosen to map onto a domain of the AWS Certified Data Engineer – Associate exam, not just to make something that works.

---

## How It Works

1. An AWS Lambda function fetches match and player data from the Riot Games API (Valorant) and OpenDota API (Dota 2) on a 6-hour EventBridge schedule
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

**Data sources:** [Riot Games API](https://developer.riotgames.com) (Valorant — requires a free dev key), [OpenDota API](https://www.opendota.com) (Dota 2 — public endpoints need no key)

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

Not yet runnable end-to-end — only infrastructure is deployed so far. This section fills in as each layer comes online.

**Prerequisites so far:** AWS account with CLI configured (`aws configure`), Node.js 20+, a free [Riot Games dev API key](https://developer.riotgames.com) (expires every 24h — a production key requires app approval)

```bash
# Deploy the data lake (S3 raw + curated buckets)
cd infra
npm install
npx cdk deploy
```

---

## Roadmap

### Week 1 — Foundation & Ingestion (In Progress)
- [x] AWS CDK project scaffolded
- [x] S3 data lake deployed (raw + curated buckets, encrypted, private)
- [ ] Ingestion Lambda (Valorant + Dota 2 fetchers)
- [ ] EventBridge cron schedule (every 6 hours)

### Week 2 — ETL & Athena
- [ ] Glue PySpark transform jobs (raw JSON → curated Parquet)
- [ ] Athena tables and partition projection

### Week 3 — API Layer
- [ ] FastAPI routes — players, matches, meta
- [ ] Lambda deployment via Mangum + API Gateway
- [ ] pytest coverage with mocked Athena responses

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

import { describe, expect, it } from "vitest";
import { derivePlayerStats, toHeroChampionStat, toMatchRow } from "./derive";
import type {
    Dota2HeroStats,
    Dota2Match,
    LoLChampionStats,
    LoLMatch,
} from "../types";

function makeDota2Match(overrides: Partial<Dota2Match> = {}): Dota2Match {
    return {
        match_id: "123",
        account_id: 3456,
        player_name: "test_player_1",
        hero_id: 6,
        team: "radiant",
        win: true,
        kills: 10,
        deaths: 2,
        assists: 5,
        kda: 7.5,
        last_hits: 200,
        denies: 10,
        gold_per_min: 600,
        xp_per_min: 700,
        net_worth: 20000,
        hero_damage: 15000,
        tower_damage: 3000,
        hero_healing: 0,
        level: 25,
        league_id: 1,
        duration_secs: 2400,
        match_date: "2026-08-01T12:00:00",
        year: 2026,
        month: 8,
        ...overrides,
    };
}

function makeLoLMatch(overrides: Partial<LoLMatch> = {}): LoLMatch {
    return {
        match_id: "abc123",
        puuid: "puuid-xyz-789",
        player_name: "test_player_1#NA1",
        champion_id: 157,
        champion_name: "Yasuo",
        team_id: 100,
        win: true,
        kills: 12,
        deaths: 3,
        assists: 8,
        gold_earned: 14000,
        damage_to_champions: 22000,
        cs: 180,
        vision_score: 25,
        champ_level: 18,
        queue_id: 420,
        duration_secs: 1800,
        match_date: "2026-08-01T12:00:00",
        year: 2026,
        month: 8,
        ...overrides,
    };
}

describe("toMatchRow", () => {
    it("resolves the Dota2 hero name via the lookup table", () => {
        const row = toMatchRow(makeDota2Match({ hero_id: 6 }), "dota2", {
            6: "Anti-Mage",
        });
        expect(row.characterName).toBe("Anti-Mage");
    });

    it("falls back to 'Unknown' when the hero id isn't in the lookup", () => {
        const row = toMatchRow(makeDota2Match({ hero_id: 999 }), "dota2", {
            6: "Anti-Mage",
        });
        expect(row.characterName).toBe("Unknown");
    });

    it("uses champion_name directly for LoL, no lookup needed", () => {
        const row = toMatchRow(makeLoLMatch({ champion_name: "Yasuo" }), "lol");
        expect(row.characterName).toBe("Yasuo");
    });

    it("carries player_name through for Dota2", () => {
        const row = toMatchRow(
            makeDota2Match({ player_name: "Miracle-" }),
            "dota2",
        );
        expect(row.playerName).toBe("Miracle-");
    });

    it("carries player_name through for LoL", () => {
        const row = toMatchRow(
            makeLoLMatch({ player_name: "Faker#KR1" }),
            "lol",
        );
        expect(row.playerName).toBe("Faker#KR1");
    });

    it("carries level through directly for Dota2", () => {
        const row = toMatchRow(makeDota2Match({ level: 27 }), "dota2");
        expect(row.level).toBe(27);
    });

    it("maps champ_level to level for LoL", () => {
        const row = toMatchRow(makeLoLMatch({ champ_level: 18 }), "lol");
        expect(row.level).toBe(18);
    });

    it("carries team through directly for Dota2", () => {
        const row = toMatchRow(makeDota2Match({ team: "dire" }), "dota2");
        expect(row.team).toBe("dire");
    });

    it("maps team_id 100/200 to blue/red for LoL", () => {
        const blueRow = toMatchRow(makeLoLMatch({ team_id: 100 }), "lol");
        const redRow = toMatchRow(makeLoLMatch({ team_id: 200 }), "lol");
        expect(blueRow.team).toBe("blue");
        expect(redRow.team).toBe("red");
    });

    it("maps net_worth/hero_damage/last_hits/denies for Dota2", () => {
        const row = toMatchRow(
            makeDota2Match({
                net_worth: 20000,
                hero_damage: 15000,
                last_hits: 200,
                denies: 10,
            }),
            "dota2",
        );
        expect(row.gold).toBe(20000);
        expect(row.damage).toBe(15000);
        expect(row.lastHits).toBe(200);
        expect(row.denies).toBe(10);
    });

    it("maps gold_earned/damage_to_champions/cs for LoL, denies null", () => {
        const row = toMatchRow(
            makeLoLMatch({
                gold_earned: 14000,
                damage_to_champions: 22000,
                cs: 180,
            }),
            "lol",
        );
        expect(row.gold).toBe(14000);
        expect(row.damage).toBe(22000);
        expect(row.lastHits).toBe(180);
        expect(row.denies).toBeNull();
    });
});

describe("derivePlayerStats", () => {
    it("returns zeroed stats for an empty match list", () => {
        expect(derivePlayerStats([], "dota2")).toEqual({
            winRate: 0,
            avgKda: 0,
            matchesPlayed: 0,
        });
    });

    it("computes win rate and avgKda (precomputed kda field) for Dota2", () => {
        const matches = [
            makeDota2Match({ win: true, kda: 8 }),
            makeDota2Match({ win: false, kda: 4 }),
        ];
        const stats = derivePlayerStats(matches, "dota2");
        expect(stats.winRate).toBe(0.5);
        expect(stats.avgKda).toBe(6);
        expect(stats.matchesPlayed).toBe(2);
    });

    it("computes avgKda for LoL as (kills + assists) / max(deaths, 1)", () => {
        const matches = [makeLoLMatch({ kills: 10, assists: 5, deaths: 3 })];
        const stats = derivePlayerStats(matches, "lol");
        expect(stats.avgKda).toBeCloseTo(5, 5);
    });

    it("guards against divide-by-zero when a LoL match has 0 deaths", () => {
        const matches = [makeLoLMatch({ kills: 10, assists: 5, deaths: 0 })];
        const stats = derivePlayerStats(matches, "lol");
        expect(stats.avgKda).toBeCloseTo(15, 5);
    });
});

describe("toHeroChampionStat", () => {
    it("normalizes a Dota2HeroStats row", () => {
        const stat: Dota2HeroStats = {
            hero_id: 6,
            hero_name: "npc_dota_hero_antimage",
            primary_attr: "agi",
            attack_type: "Melee",
            pub_pick: 100,
            pub_win: 60,
            pro_pick: 0,
            pro_win: 0,
            pro_ban: 0,
            win_rate: 0.6,
            ban_rate: 0.05,
            pick_rate: 0.1,
        };
        expect(toHeroChampionStat(stat, "dota2")).toEqual({
            id: 6,
            name: "npc_dota_hero_antimage",
            pickRate: 0.1,
            winRate: 0.6,
            sampleSize: 100,
        });
    });

    it("normalizes a LoLChampionStats row", () => {
        const stat: LoLChampionStats = {
            champion_id: 157,
            champion_name: "Yasuo",
            matches_played: 12,
            wins: 6,
            pick_rate: 0.12,
            win_rate: 0.5,
        };
        expect(toHeroChampionStat(stat, "lol")).toEqual({
            id: 157,
            name: "Yasuo",
            pickRate: 0.12,
            winRate: 0.5,
            sampleSize: 12,
        });
    });
});

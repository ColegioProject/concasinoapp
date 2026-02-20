-- ============================================================
-- CONWAY CASINO — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PLAYERS (human wallets)
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address       TEXT NOT NULL UNIQUE,   -- EVM address lowercase
  display_name  TEXT,
  balance       BIGINT NOT NULL DEFAULT 0,  -- USDC in cents (100 = $1.00)
  total_wagered BIGINT NOT NULL DEFAULT 0,
  total_won     BIGINT NOT NULL DEFAULT 0,
  games_played  INT    NOT NULL DEFAULT 0,
  biggest_win   BIGINT NOT NULL DEFAULT 0,
  win_streak    INT    NOT NULL DEFAULT 0,
  best_streak   INT    NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_address ON players(address);
CREATE INDEX idx_players_total_won ON players(total_won DESC);

-- ============================================================
-- AGENTS (AI wallets)
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT,
  api_key           TEXT NOT NULL UNIQUE,
  wallet_address    TEXT NOT NULL UNIQUE,
  withdraw_address  TEXT,                 -- Where to send winnings
  balance           BIGINT NOT NULL DEFAULT 0,
  freeroll_used     BOOLEAN NOT NULL DEFAULT FALSE,
  freeroll_won      BOOLEAN NOT NULL DEFAULT FALSE,
  total_games       INT    NOT NULL DEFAULT 0,
  total_wagered     BIGINT NOT NULL DEFAULT 0,
  total_won         BIGINT NOT NULL DEFAULT 0,
  biggest_win       BIGINT NOT NULL DEFAULT 0,
  win_streak        INT    NOT NULL DEFAULT 0,
  best_streak       INT    NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_played_at    TIMESTAMPTZ
);

CREATE INDEX idx_agents_api_key ON agents(api_key);
CREATE INDEX idx_agents_wallet ON agents(wallet_address);
CREATE INDEX idx_agents_total_won ON agents(total_won DESC);

-- ============================================================
-- GAMES (every single game result)
-- ============================================================
CREATE TYPE game_type_enum   AS ENUM ('coinflip', 'blackjack', 'dice', 'roulette');
CREATE TYPE game_outcome_enum AS ENUM ('win', 'lose', 'push');
CREATE TYPE player_type_enum  AS ENUM ('human', 'agent');

CREATE TABLE IF NOT EXISTS games (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id       UUID,   -- NULL if agent
  agent_id        UUID,   -- NULL if human
  player_type     player_type_enum NOT NULL,
  game_type       game_type_enum   NOT NULL,
  bet             BIGINT NOT NULL,          -- cents
  outcome         game_outcome_enum NOT NULL,
  payout          BIGINT NOT NULL DEFAULT 0,-- cents
  profit          BIGINT NOT NULL DEFAULT 0,-- net: payout - bet (negative = loss)
  is_freeroll     BOOLEAN NOT NULL DEFAULT FALSE,
  seed_hash       TEXT NOT NULL,
  seed            TEXT NOT NULL,
  vm_id           TEXT NOT NULL,
  result_data     JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id)  REFERENCES agents(id)  ON DELETE SET NULL
);

CREATE INDEX idx_games_player_id  ON games(player_id);
CREATE INDEX idx_games_agent_id   ON games(agent_id);
CREATE INDEX idx_games_game_type  ON games(game_type);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_outcome    ON games(outcome);

-- ============================================================
-- DEPOSITS (USDC in)
-- ============================================================
CREATE TYPE tx_status_enum AS ENUM ('pending', 'confirmed', 'failed');

CREATE TABLE IF NOT EXISTS deposits (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id    UUID,
  agent_id     UUID,
  amount       BIGINT NOT NULL,     -- cents
  tx_hash      TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  status       tx_status_enum NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id)  REFERENCES agents(id)  ON DELETE SET NULL
);

CREATE INDEX idx_deposits_tx_hash   ON deposits(tx_hash);
CREATE INDEX idx_deposits_player_id ON deposits(player_id);

-- ============================================================
-- WITHDRAWALS (USDC out)
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   UUID,
  agent_id    UUID,
  amount      BIGINT NOT NULL,
  tx_hash     TEXT UNIQUE,
  to_address  TEXT NOT NULL,
  status      tx_status_enum NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id)  REFERENCES agents(id)  ON DELETE SET NULL
);

-- ============================================================
-- LEADERBOARD VIEW (materialized for performance)
-- ============================================================
CREATE MATERIALIZED VIEW leaderboard AS
  -- Human players
  SELECT
    p.id,
    p.address,
    COALESCE(p.display_name, CONCAT('0x', UPPER(SUBSTRING(p.address, 3, 4)), '...', UPPER(SUBSTRING(p.address, LENGTH(p.address)-3, 4)))) AS display_name,
    'human'::TEXT  AS player_type,
    p.total_won,
    p.total_wagered,
    p.games_played,
    p.biggest_win,
    p.best_streak,
    CASE WHEN p.total_wagered > 0 
         THEN ROUND((p.total_won::NUMERIC / p.total_wagered::NUMERIC) * 100, 1) 
         ELSE 0 END AS roi_pct,
    p.created_at
  FROM players p
  WHERE p.games_played > 0

  UNION ALL

  -- Agent players
  SELECT
    a.id,
    a.wallet_address AS address,
    COALESCE(a.name, CONCAT('Agent_', UPPER(SUBSTRING(a.wallet_address, 3, 6)))) AS display_name,
    'agent'::TEXT   AS player_type,
    a.total_won,
    a.total_wagered,
    a.total_games   AS games_played,
    a.biggest_win,
    a.best_streak,
    CASE WHEN a.total_wagered > 0 
         THEN ROUND((a.total_won::NUMERIC / a.total_wagered::NUMERIC) * 100, 1) 
         ELSE 0 END AS roi_pct,
    a.created_at
  FROM agents a
  WHERE a.total_games > 0;

CREATE UNIQUE INDEX idx_leaderboard_id ON leaderboard(id);
CREATE INDEX idx_leaderboard_won ON leaderboard(total_won DESC);

-- Refresh function (call after each game)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh leaderboard after each game
CREATE TRIGGER trigger_refresh_leaderboard
  AFTER INSERT ON games
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_leaderboard();

-- ============================================================
-- STATS VIEW (global casino stats)
-- ============================================================
CREATE VIEW casino_stats AS
SELECT
  COUNT(*)                                    AS total_games,
  COUNT(DISTINCT COALESCE(player_id::TEXT, agent_id::TEXT)) AS unique_players,
  SUM(bet)                                    AS total_wagered,
  SUM(CASE WHEN outcome = 'win' THEN payout ELSE 0 END) AS total_paid_out,
  MAX(payout)                                 AS biggest_win_ever,
  COUNT(CASE WHEN outcome = 'win'  THEN 1 END) AS total_wins,
  COUNT(CASE WHEN outcome = 'lose' THEN 1 END) AS total_losses,
  COUNT(CASE WHEN is_freeroll THEN 1 END)      AS total_freerolls
FROM games;

-- ============================================================
-- FUNCTION: update player stats after game
-- ============================================================
CREATE OR REPLACE FUNCTION update_player_stats(
  p_player_id   UUID,
  p_is_agent    BOOLEAN,
  p_bet         BIGINT,
  p_payout      BIGINT,
  p_outcome     game_outcome_enum,
  p_profit      BIGINT
) RETURNS VOID AS $$
DECLARE
  v_won BOOLEAN := p_outcome = 'win';
BEGIN
  IF p_is_agent THEN
    UPDATE agents SET
      balance       = balance + p_profit,
      total_wagered = total_wagered + p_bet,
      total_won     = total_won + p_payout,
      total_games   = total_games + 1,
      biggest_win   = GREATEST(biggest_win, p_payout),
      win_streak    = CASE WHEN v_won THEN win_streak + 1 ELSE 0 END,
      best_streak   = GREATEST(best_streak, CASE WHEN v_won THEN win_streak + 1 ELSE 0 END),
      last_played_at = NOW()
    WHERE id = p_player_id;
  ELSE
    UPDATE players SET
      balance       = balance + p_profit,
      total_wagered = total_wagered + p_bet,
      total_won     = total_won + p_payout,
      games_played  = games_played + 1,
      biggest_win   = GREATEST(biggest_win, p_payout),
      win_streak    = CASE WHEN v_won THEN win_streak + 1 ELSE 0 END,
      best_streak   = GREATEST(best_streak, CASE WHEN v_won THEN win_streak + 1 ELSE 0 END),
      last_seen_at  = NOW()
    WHERE id = p_player_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE players     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE games       ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Public read for leaderboard
CREATE POLICY "leaderboard_public_read" ON players
  FOR SELECT USING (true);

-- Games are public read (provably fair = transparent)
CREATE POLICY "games_public_read" ON games
  FOR SELECT USING (true);

-- Players can only see their own deposits/withdrawals
CREATE POLICY "deposits_own" ON deposits
  FOR SELECT USING (true);  -- relax for now, tighten with auth later

CREATE POLICY "withdrawals_own" ON withdrawals
  FOR SELECT USING (true);

-- Server-side (service role) can do everything
-- These policies allow our API (service_role key) full access
CREATE POLICY "server_all_players"     ON players     FOR ALL USING (true);
CREATE POLICY "server_all_agents"      ON agents      FOR ALL USING (true);
CREATE POLICY "server_all_games"       ON games       FOR ALL USING (true);
CREATE POLICY "server_all_deposits"    ON deposits    FOR ALL USING (true);
CREATE POLICY "server_all_withdrawals" ON withdrawals FOR ALL USING (true);

-- ============================================================
-- SEED DATA (example leaderboard entries)
-- ============================================================
INSERT INTO players (address, display_name, balance, total_wagered, total_won, games_played, biggest_win, best_streak) VALUES
  ('0xdeadbeef00000000000000000000000000000001', 'CryptoWhale',   50000,  980000, 1250000, 312, 350000, 8),
  ('0xdeadbeef00000000000000000000000000000002', 'NightOwl',       8000,  420000,  530000, 187,  97500, 5),
  ('0xdeadbeef00000000000000000000000000000003', 'SatoshiGhost',   2500,  210000,  260000,  94,  45000, 4),
  ('0xdeadbeef00000000000000000000000000000004', 'DeFiDegen',        500,   85000,   92000,  41,  18000, 3),
  ('0xdeadbeef00000000000000000000000000000005', 'OnChainLarry',      0,   34000,   31000,  22,   9500, 2)
ON CONFLICT (address) DO NOTHING;

INSERT INTO agents (name, api_key, wallet_address, total_wagered, total_won, total_games, biggest_win, best_streak) VALUES
  ('GamblingBot3000', 'cc_agent_seed_001', '0xbotbotbot00000000000000000000000000001', 640000, 890000, 450, 220000, 12),
  ('AlphaAgent',      'cc_agent_seed_002', '0xbotbotbot00000000000000000000000000002', 220000, 310000, 180,  88000,  7),
  ('RNGHunter',       'cc_agent_seed_003', '0xbotbotbot00000000000000000000000000003',  95000, 102000,  88,  35000,  5)
ON CONFLICT (api_key) DO NOTHING;

-- Refresh leaderboard with seed data
REFRESH MATERIALIZED VIEW leaderboard;

Feature: 4.0 Streaks
    As a daily habit-builder
    I want an honest, instantly updated current-streak count on every habit row
    So that the number motivating me to come back tomorrow is always truthful


# --------------------------------------------------------------------------------------------------
# Streak Rule
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-5xu6Aag] The application shall display a current-streak badge on every habit row
    Given at least one habit exists in the current view
    When the habit list renders
    Then each row displays a streak badge showing a non-negative integer

Scenario: [TOR-04-cS2CaLm] The application shall compute the current streak as the count of consecutive completed local calendar days ending today, when today is completed
    Given habits with the following completion histories, where "today" is the current local date:
        | completions (relative to today) | expected streak |
        | today                           | 1               |
        | today, -1                       | 2               |
        | today, -1, -2, -3               | 4               |
        | today, -1, -3, -4               | 2               |
    When the habit list renders
    Then each row's streak badge shows the expected streak from the table (a gap resets the run — the last row is 2, not 4)

Scenario: [TOR-04-ixZC5y3] The application shall keep the streak visible without reset when today is not yet completed but yesterday is
    Given a habit whose most recent completions are yesterday and the days before it, consecutively, and today is not completed
    When the habit list renders
    Then the streak badge shows the count of consecutive completed days ending yesterday

Scenario: [TOR-04-Dzlhzul] The application shall display a streak of 0 when neither today nor yesterday is completed
    Given a habit whose most recent completion is two or more days ago
    When the habit list renders
    Then the streak badge reads 0


# --------------------------------------------------------------------------------------------------
# Live Updates
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-Ft8iQbI] The application shall update the streak badge immediately when "Done today" is toggled, without a page reload
    Given a habit whose streak badge reads 0 because its last completion is stale
    When the user checks "Done today" on that row
    Then the streak badge changes to 1 in the already-rendered page, with no reload

Scenario: [TOR-04-GN2fJoI] The application shall recompute a restored habit's streak from its preserved completion history
    Given an archived habit is restored to the Active view
    When its row renders
    Then the streak badge shows the history-derived value: the consecutive-days count if yesterday or today is completed, otherwise 0

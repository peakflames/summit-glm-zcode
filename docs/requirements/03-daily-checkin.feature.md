Feature: 3.0 Daily Check-in
    As a daily habit-builder
    I want to mark a habit done for today with one click, and undo an accidental tap
    So that recording my day takes seconds and mistakes cost nothing


# --------------------------------------------------------------------------------------------------
# Recording Today's Completion
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-03-WUQGIE9] The application shall record today's completion when the "Done today" toggle button is clicked
    Given a habit row whose "Done today" toggle button is in its undone state
    When the user clicks the "Done today" button
    Then the button reads "Done ✓" in its done state
    And the habit's stored completions contain exactly one entry for today's date
    And the done state persists after a page reload

Scenario: [TOR-03-M5RmMBx] The application shall remove today's completion when an already-done "Done today" toggle button is clicked again
    Given a habit with today's completion already recorded and a visible streak
    When the user clicks the "Done ✓" button
    Then the button returns to its undone "Done today" state
    And today's date is removed from the habit's stored completions
    And the streak badge recomputes to the value for consecutive days ending yesterday

Scenario: [TOR-03-zr7VepE] The application shall record at most one completion per habit per local calendar day, regardless of repeated clicks or reloads
    Given a habit already has today's date in its completions
    When the page is reloaded and the user toggles "Done today" off and back on
    Then the stored completions contain exactly one entry for today's date, never a duplicate

Scenario: [TOR-03-albP5kN] The application shall record completions as local calendar dates (YYYY-MM-DD) in the user's timezone, not UTC dates
    #
    # Note:
    #   1. Streak semantics are local-day based (ConOps §8); storing UTC dates would shift
    #      the day boundary for users far from UTC.
    #
    Given the user's local time is 2026-09-04 23:30 while the UTC date is already 2026-09-05
    When the user clicks "Done today"
    Then the stored completion for the habit is the string "2026-09-04"

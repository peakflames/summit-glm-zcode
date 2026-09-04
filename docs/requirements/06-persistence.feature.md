Feature: 6.0 Persistence & Data Integrity
    As a privacy-conscious habit-builder
    I want every change saved instantly to my browser under a versioned schema, and never sent anywhere
    So that my data survives restarts, works offline, and stays mine


# --------------------------------------------------------------------------------------------------
# Storage Schema & Write Behavior
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-06-anYR3mD] The application shall persist all state under the single localStorage key "summit.habits.v1" as a JSON document with schemaVersion 1 and a habits array
    Given at least one habit has been created
    When the browser's localStorage is inspected
    Then the key "summit.habits.v1" holds valid JSON with "schemaVersion" equal to 1 and a "habits" array
    And each element carries id, name, createdAt, archived, and completions

Scenario: [TOR-06-OcAYtZQ] The application shall write state to localStorage immediately upon every mutation, with no save button or delay
    Given Summit is open with existing habits
    When the user performs each of: add a habit, toggle "Done today", archive a habit, restore a habit
    Then after each individual action the stored document already reflects that change, without any reload or explicit save

Scenario: [TOR-06-OQbS0LR] The application shall hydrate its state from localStorage on boot so that habits, streaks, archived flags, and today's check-ins all survive a reload
    Given stored state contains one active habit with streak 2 and today checked, plus one archived habit
    When the page is reloaded
    Then the active habit renders with streak 2 and "Done today" checked
    And the archived habit appears under the Archived filter


# --------------------------------------------------------------------------------------------------
# First Run & Recovery
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-06-7l9Trjh] The application shall start cleanly with an empty state and no error when the storage key is absent
    Given a browser profile with no "summit.habits.v1" key
    When Summit loads
    Then the app renders normally with the "No habits yet" empty state
    And no error banner is shown

Scenario: [TOR-06-PlcuFFf] The application shall surface unreadable saved data with an in-page banner that names the problem and offers a "Start fresh" action, rather than silently showing an empty list
    Given the key "summit.habits.v1" contains invalid JSON
    When Summit loads
    Then a banner visible in the page explains that saved data could not be read and offers a "Start fresh" action
    And the app does not silently render the normal empty state

Scenario: [TOR-06-CStJTf4] The application shall treat a stored schemaVersion it does not understand as unreadable data and show the same recovery banner
    #
    # Note:
    #   1. v1 must never rewrite a document written by a future schema version — recovery is
    #      offered, silent migration is not (PV §10).
    #
    Given the key "summit.habits.v1" contains otherwise-valid JSON with "schemaVersion" 99
    When Summit loads
    Then the unreadable-data banner with the "Start fresh" action is shown

Scenario: [TOR-06-I9rZxQC] The application shall reset to a clean empty state when the user chooses "Start fresh"
    Given the unreadable-data banner is showing
    When the user clicks "Start fresh"
    Then the banner is dismissed and the Active view shows the "No habits yet" empty state
    And the storage key now contains a fresh empty v1 document

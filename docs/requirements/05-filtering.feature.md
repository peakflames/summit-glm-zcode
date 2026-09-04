Feature: 5.0 Filtering
    As a daily habit-builder
    I want to switch between Active, Archived, and All views of my habits
    So that my daily list stays uncluttered while nothing I have done is ever lost


# --------------------------------------------------------------------------------------------------
# Filter Control
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-05-GjGNESQ] The application shall offer a three-segment filter control labeled "All", "Active", and "Archived"
    Given Summit is open with habits present
    When the page renders
    Then a filter control is visible with three selectable segments labeled "All", "Active", and "Archived"

Scenario: [TOR-05-PrNhHoE] The application shall open with the Active filter selected by default
    Given Summit is loaded in a browser (fresh or with existing data)
    When the page renders
    Then the "Active" segment of the filter control is the selected one

Scenario: [TOR-05-sAMxFFs] The application shall show only active habits in the Active view and only archived habits in the Archived view
    Given two active habits and one archived habit exist
    When the user switches the filter from "Active" to "Archived"
    Then the Archived view lists exactly the archived habit, with a "Restore" action and its streak badge
    And switching back to "Active" lists exactly the two active habits, each with an "Archive" action

Scenario: [TOR-05-qD4GGzl] The application shall show every habit in the All view with archived rows visually distinguished
    Given two active habits and one archived habit exist
    When the user selects the "All" filter segment
    Then the list shows all three rows
    And the archived habit's row carries a visible "Archived" tag and offers "Restore" rather than "Archive"


# --------------------------------------------------------------------------------------------------
# Empty States
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-05-0maiBlC] The application shall show a distinct, friendly empty state for each filter that has no rows
    Given the app state matches each row of the table below
    When the corresponding filter is selected:
        | app state                | filter    | expected empty-state message            |
        | no habits at all         | Active    | "No habits yet. Add your first habit above." |
        | only archived habits     | Active    | "No active habits."                     |
        | no archived habits       | Archived  | "No archived habits."                   |
    Then each case renders its expected message instead of an empty list area

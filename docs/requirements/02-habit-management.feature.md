Feature: 2.0 Habit Management
    As a daily habit-builder
    I want to add habits by name, archive the ones I have dropped, and restore them later
    So that my daily list reflects the habits I actually practice without ever losing history


# --------------------------------------------------------------------------------------------------
# Adding Habits
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-XOoULU3] The application shall add a new habit by name through the "Add habit" input and Add button, showing it immediately in the habit list
    Given the Active view is open
    When the user types "Read 20 minutes" into the "Add habit" input and clicks "Add"
    Then a new row appears in the list showing the name "Read 20 minutes", a streak badge of 0, an unchecked "Done today" checkbox, and an "Archive" action
    And the "Add habit" input is cleared

Scenario: [TOR-02-w9nrh1o] The application shall submit the "Add habit" input when the user presses Enter, behaving identically to clicking Add
    Given the user has typed "Meditate" into the "Add habit" input
    When the user presses Enter in the input
    Then a row for "Meditate" appears in the list with the same outcomes as clicking "Add"

Scenario: [TOR-02-G8b7pmU] The application shall persist a newly added habit so that it survives a page reload
    Given the habit "Read 20 minutes" was just added
    When the page is reloaded
    Then the "Read 20 minutes" row is present in the Active view with its name unchanged

Scenario: [TOR-02-flxKIoM] The application shall reject an empty or whitespace-only habit name with an inline error that names the problem and the next user action
    Given the "Add habit" input contains only spaces or is empty
    When the user clicks "Add"
    Then no habit row is created
    And an inline message appears stating the name is empty and prompting the user to type a habit name first

Scenario: [TOR-02-lMWubKc] The application shall enforce a maximum habit-name length of 80 characters, accepting a name of exactly 80 characters and rejecting 81 or more
    Given the "Add habit" input is open
    When the user submits names of the following lengths:
        | name length | outcome                             |
        | 80          | habit added                         |
        | 81          | rejected with inline length error   |
    Then each accepted name appears as a row, and each rejected attempt shows an inline error naming the 80-character limit and the next action (shorten the name)

Scenario: [TOR-02-f9diV8o] The application shall allow duplicate habit names, creating a second independent habit row
    Given a habit named "Read 20 minutes" already exists
    When the user adds another habit also named "Read 20 minutes"
    Then the list shows two rows named "Read 20 minutes"
    And completing a check-in on one row leaves the other row's completions and streak untouched


# --------------------------------------------------------------------------------------------------
# Archiving & Restoring
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-c7UnNH0] The application shall archive a habit on demand, removing it from the Active view while preserving its completion history
    Given the Active view shows a "Gym" row with streak 4
    When the user clicks "Archive" on the Gym row
    Then the Gym row no longer appears in the Active view
    And the stored habit has archived set to true with its completions unchanged

Scenario: [TOR-02-E0o3IbX] The application shall restore an archived habit on demand, returning it to the Active view with its completion history intact
    Given the habit "Gym" is archived with four completions in its history
    When the user opens the Archived filter and clicks "Restore" on the Gym row
    Then Gym no longer appears in the Archived view and appears again in the Active view
    And the stored habit has archived set to false with its completions unchanged

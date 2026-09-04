Feature: 1.0 Application Shell & Boot
    As a daily habit-builder
    I want Summit to open instantly into a usable single-screen app that tells me what version I am running
    So that checking in on my habits takes seconds and I can trust the tool is transparent about itself


# --------------------------------------------------------------------------------------------------
# Version & Startup Diagnostics (baseline tool hygiene)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-9FydwtZ] The application footer shall display the application name and semantic version in the format "Summit vX.Y.Z", sourced from package.json#version
    Given Summit is built at version X.Y.Z and opened in a browser
    When the page renders
    Then the footer contains a string matching /^Summit v\d+\.\d+\.\d+$/
    And the version in that string equals the version field of package.json

Scenario: [TOR-01-WqWceSw] The application shall emit a startup log line containing its name and semantic version at INFO level as the first console record on boot
    Given a browser console with no prior Summit records
    When the Summit page loads
    Then the first console record matches /^\[INFO\] Summit v\d+\.\d+\.\d+ starting$/
    And the record is emitted at the INFO level (console.info)

Scenario: [TOR-01-QdBg1u6] The application shall define its semantic version in exactly one source, package.json#version, such that a change there changes both the footer and the startup log line
    Given the application is built and its footer shows "Summit v0.1.0"
    When the version field in package.json is changed and the application is rebuilt
    Then the footer shows the new version
    And the startup log line shows the same new version
    And the footer version and startup log version never disagree with each other or with package.json#version

Scenario: [TOR-01-LWNJkRM] The application logger shall emit records at the DEBUG, INFO, WARN, and ERROR levels in human-readable plain-text format "[LEVEL] message" via the corresponding console methods
    Given the application is running
    When a component logs a single message at each of the four levels
    Then console.debug receives the message prefixed "[DEBUG] ", console.info receives "[INFO] ", console.warn receives "[WARN] ", and console.error receives "[ERROR] "

Scenario: [TOR-01-yNjDWrJ] The application shall display user-facing error messages in the page that name the problem AND the next user action, never console-only
    Given an action the user attempted has failed
    When the failure occurs
    Then an inline message visible in the page names what went wrong and what to do next (e.g., "Couldn't save your habit: localStorage is full. Remove archived habits to free space.")
    And the message is readable without opening developer tools


# --------------------------------------------------------------------------------------------------
# Boot & Offline Operation
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-UBs4L4y] The application shall boot directly into a usable single-screen interface with no account, configuration, or setup step
    Given a browser profile with no prior Summit data
    When the user opens Summit
    Then the page shows, with no sign-up or configuration: a header, an "Add habit" input with an "Add" button, a filter control, a habit list area, and a version footer
    And the "Add habit" input can be typed into immediately

Scenario: [TOR-01-0d73l6K] The application shall make zero network requests and remain fully functional offline after first load
    Given Summit has been loaded at least once in the browser
    When the network goes offline and the user performs add, check-in, archive, restore, and filter actions
    Then every action succeeds and persisted state remains correct after a reload
    And the browser's network panel records no outgoing requests for those actions

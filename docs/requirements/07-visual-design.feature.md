Feature: 7.0 Visual Design
    As a daily habit-builder
    I want the app to look and feel like a considered, single coherent product, not a bare unstyled page
    So that I trust the tool the moment I open it, and can always tell at a glance what's interactive, what's primary, and what's already selected


# --------------------------------------------------------------------------------------------------
# Brand Canvas & Typography
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-xFBFuj6] The web application shall render its interface on a dark, obsidian-toned canvas using the PeakFlames Design System's brand type ramp
    #
    # Note:
    #   1. "Brand type ramp" means Archivo for display/heading text and IBM Plex Sans for body
    #      text, as vendored from the PeakFlames Design System token CSS — not a system-ui
    #      fallback stack.
    #
    Given the app is loaded in a browser with the PeakFlames Design System fonts available
    When the user views the page
    Then the page background color should be a dark obsidian tone, not a light/off-white tone
    And the page's heading text should render in the Archivo font family
    And the page's body text should render in the IBM Plex Sans font family
    And the brand webfonts should be actually loaded (document.fonts), not a system-ui fallback render

Scenario: [TOR-07-ywpamQm] The web application shall render with system-font fallback and remain fully functional when the PeakFlames brand webfonts cannot be fetched
    #
    # Note:
    #   1. The brand webfonts (Archivo / IBM Plex Sans / JetBrains Mono) are fetched from
    #      Google Fonts on first load and cached thereafter (ConOps §6). This TOR pins the
    #      degradation path: a blocked CDN or fully offline first load must degrade
    #      typography, never functionality.
    #
    Given the app is loaded in a browser with no access to fonts.googleapis.com or fonts.gstatic.com
    When the user views the page and uses the app normally
    Then the page renders with system-font fallbacks instead of the brand type ramp
    And every feature of the app remains fully functional (add, check-in, filter, archive)


# --------------------------------------------------------------------------------------------------
# Hierarchy & Accent Discipline
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-EXjNoVz] The web application shall render exactly one flame-accented "hot" element per view, reserved for the primary action
    #
    # Note:
    #   1. This is the "one hot element per view" rule from the PeakFlames Design System,
    #      expressed as an observable constraint: the add-habit submit button (the one control
    #      guaranteed present regardless of habit count) carries the flame accent; no other
    #      control on the same view shares that treatment.
    #
    Given the app is loaded and displaying the Active habits view
    When the user views the page
    Then exactly one control on the page should carry the flame-accent (primary) visual treatment
    And all other controls should use a non-flame visual treatment

Scenario: [TOR-07-c3lKxoV] The web application shall display a visible focus ring on any interactive control when it receives keyboard focus
    Given the app is loaded in a browser
    When the user tabs through the add-habit input, the filter segments, and a habit row's controls using the keyboard
    Then each focused control should display a visible focus ring
    And the focus ring should remain visible until focus moves to another control


# --------------------------------------------------------------------------------------------------
# Filter Selection State
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-o4sphQD] The web application shall indicate the currently selected Active/Archived filter using the PeakFlames Design System's ember gradient treatment
    Given the app is loaded and the Active filter is selected
    When the user switches to the Archived filter
    Then the Archived filter segment should display the ember gradient selection treatment
    And the Active filter segment should no longer display the ember gradient selection treatment


# --------------------------------------------------------------------------------------------------
# Visual Hierarchy
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-pa7ak24] The application shall render the streak number more visually prominent than the habit name on every habit row
    #
    # Note:
    #   1. The streak is the app's primary motivational signal (PV §9: "the visual hero of
    #       each row"). Prominence is observable: larger font size and/or heavier weight
    #       than the habit-name text on the same row.
    #
    Given the app is loaded with at least one habit present
    When the user views a habit row
    Then the row's streak number should be rendered larger and/or heavier than the habit name on that row

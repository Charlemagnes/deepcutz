# Deepcutz Domain Context

Album-logging/review platform ("Letterboxd for music"). This covers the social/logging domain: profiles, albums, reviews, diary entries, follows, likes, comments, and the home feed that surfaces them.

## Language

**Feed**:
The reverse-chronological list of `reviews` shown on `/` (`HomeFeed`), sourced from the profiles the viewer follows plus the viewer's own reviews. `diary_entries` are deliberately excluded today (they'd render identically to reviews via the same `FeedCard`).
_Avoid_: Timeline, activity stream

**Empty feed state**:
The full "YOUR FEED IS EMPTY" panel replacing the main feed column, shown only when the feed has nothing at all to display — the viewer has no reviews of their own and follows nobody with reviews. Includes an embedded follow-nudge panel.
_Avoid_: Empty state (ambiguous with the follow-nudge banner below)

**Follow nudge**:
A prompt suggesting listeners to follow, backed by `WhoToFollowList`. Takes two forms depending on feed state: the full panel variant inside the empty feed state, and a slim banner variant shown above a non-empty feed when the viewer follows nobody (e.g. they have own reviews but no follows yet). The persistent sidebar copy (aside, `xl` breakpoint only) is a third, always-present instance and isn't itself called a "nudge" since it's not conditional on feed state.
_Avoid_: Suggestions (used for the underlying `whoToFollowData`/profile-suggestion query, not the UI prompt itself)

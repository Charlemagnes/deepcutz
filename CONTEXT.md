# deepcutz

Album-logging/review platform. Single bounded context — reviews, replies, likes, follows, and feed all share one glossary.

## Language

**Reply**:
The user-facing verb and label for creating a `Comment` row, at any nesting depth. A top-level Reply is addressed to the review itself; a nested Reply is addressed to another Reply. UI copy always says "Reply," never "Comment."
_Avoid_: Comment (as a UI label — reserve "comment" for the underlying schema/table/entity name only)

**Comment**:
The underlying entity/table (`public.comments`) backing a Reply. Every row stores `review_id` directly (even when nested), plus an optional `parent_comment_id` for the Reply it replies to. Null `parent_comment_id` means it's a top-level Reply to the review.
_Avoid_: Reply (as the schema/table name — "Comment" is for code/schema, "Reply" is for UI)

**Quick Reply**:
The inline compose action available wherever a review card is rendered (e.g. the album page). Always creates a top-level Comment (`parent_comment_id` null) directly on the review; the new Reply appends to the inline list in place with no navigation and no toast — its appearance in the list is the only confirmation.
_Avoid_: Comment form (old name, still used as the component filename but not as a concept people should reason about separately from Quick Reply)

**Reply Thread**:
The full set of Comments belonging to one review, rendered on the Thread Page as a single flat, chronologically-ordered list — not a visually indented tree. A nested Reply shows a "replying to @user" tag pointing at its `parent_comment_id` instead of indentation. This is a deliberate front-end rendering choice: the schema supports arbitrary nesting depth via the self-referential FK, but the Reply Thread always displays flat, matching Twitter's reply-chain UI rather than Reddit-style nesting.

**Thread Page**:
The dedicated per-review page (route TBD, e.g. `/review/[id]`) whose primary focus is the Reply Thread. Album and review context are shown at reduced visual prominence, mirroring Twitter's tweet-detail view. Distinct from the album page's inline Quick Reply list — replying to a specific (non-review) Reply is only possible on the Thread Page.

## Deferred

Comment likes (`likes.target_type = 'comment'`, `comments.like_count`, mirroring trigger) are speced in the implementation plan as item 5 of Phase 4.5, split out from item 4 (threading) so threading ships independently.

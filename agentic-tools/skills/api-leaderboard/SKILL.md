---
name: api-leaderboard
description: Add score tracking and leaderboards to Spectacles Lenses using the LeaderboardModule. Supports global and friends rankings, score submission, and custom TTL. Load when implementing score tracking, competitive gameplay, or player rankings.
user-invocable: false
---

# Leaderboard Module — Score Tracking & Rankings

**Requirements:** Lens Studio v5.7+, Spectacles OS v5.60+. Add `LeaderboardModule` to project.

> Privacy: each user must opt in to share scores. Leaderboards are Lens-scoped (unique per Lens ID + name).
> Use **LeaderboardModule** (not the mobile Leaderboard Component) — provides raw data, no built-in UI.

---

## Setup

```typescript
private leaderboardModule = require('LensStudio:LeaderboardModule')
```

---

## Create / Get a Leaderboard

```typescript
const options = Leaderboard.CreateOptions.create()
options.name = 'my_leaderboard'        // unique within this Lens
options.ttlSeconds = 800000            // reset interval in seconds (0 = default 1 year)
options.orderingType = Leaderboard.OrderingType.Descending  // Descending = high score first

this.leaderboardModule.getLeaderboard(
  options,
  (leaderboard) => {
    // leaderboard is ready — submit or read
  },
  (status) => {
    print('[Leaderboard] getLeaderboard failed: ' + status)
  }
)
```

---

## Submit a Score

```typescript
leaderboard.submitScore(
  score,  // number
  (currentUserInfo) => {
    if (!isNull(currentUserInfo)) {
      print('[Leaderboard] Submitted. User: ' + currentUserInfo.snapchatUser.displayName
        + ', Score: ' + currentUserInfo.score)
    }
  },
  (status) => {
    print('[Leaderboard] Submit failed: ' + status)
  }
)
```

---

## Read Leaderboard Entries

```typescript
const retrieval = Leaderboard.RetrievalOptions.create()
retrieval.usersLimit = 10
retrieval.usersType = Leaderboard.UsersType.Global  // or .Friends

leaderboard.getLeaderboardInfo(
  retrieval,
  (otherRecords, currentUserRecord) => {
    print('[Leaderboard] Current user: '
      + currentUserRecord.snapchatUser.displayName
      + ', Score: ' + currentUserRecord.score)

    otherRecords.forEach((record) => {
      if (record?.snapchatUser?.displayName) {
        print('[Leaderboard] ' + record.snapchatUser.displayName + ': ' + record.score)
      }
    })
  },
  (status) => {
    print('[Leaderboard] getLeaderboardInfo failed: ' + status)
  }
)
```

---

## Full Component Pattern

```typescript
@component
export class LeaderboardManager extends BaseScriptComponent {
  @input
  @hint('Leaderboard name (unique per Lens)')
  leaderboardName: string = 'my_leaderboard'

  @input
  @hint('Leaderboard reset interval in seconds')
  ttlSeconds: number = 800000

  private leaderboardModule = require('LensStudio:LeaderboardModule')
  private leaderboard: Leaderboard | null = null

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.init())
  }

  private init(): void {
    const options = Leaderboard.CreateOptions.create()
    options.name = this.leaderboardName
    options.ttlSeconds = this.ttlSeconds
    options.orderingType = Leaderboard.OrderingType.Descending

    this.leaderboardModule.getLeaderboard(
      options,
      (lb) => {
        this.leaderboard = lb
        print('[Leaderboard] Ready')
      },
      (status) => {
        print('[Leaderboard] Init failed: ' + status)
      }
    )
  }

  public submitScore(score: number): void {
    if (!this.leaderboard) {
      print('[Leaderboard] Not ready yet')
      return
    }
    this.leaderboard.submitScore(
      score,
      (info) => {
        if (!isNull(info)) {
          print('[Leaderboard] Score submitted: ' + info.score)
        }
      },
      (status) => print('[Leaderboard] Submit failed: ' + status)
    )
  }

  public loadGlobal(limit: number, onLoaded: (entries: Leaderboard.UserRecord[], me: Leaderboard.UserRecord) => void): void {
    if (!this.leaderboard) return
    const opts = Leaderboard.RetrievalOptions.create()
    opts.usersLimit = limit
    opts.usersType = Leaderboard.UsersType.Global
    this.leaderboard.getLeaderboardInfo(opts, onLoaded, (s) => print('[Leaderboard] Load failed: ' + s))
  }

  public loadFriends(limit: number, onLoaded: (entries: Leaderboard.UserRecord[], me: Leaderboard.UserRecord) => void): void {
    if (!this.leaderboard) return
    const opts = Leaderboard.RetrievalOptions.create()
    opts.usersLimit = limit
    opts.usersType = Leaderboard.UsersType.Friends
    this.leaderboard.getLeaderboardInfo(opts, onLoaded, (s) => print('[Leaderboard] Load failed: ' + s))
  }
}
```

---

## Key Types

| Type | Description |
|------|-------------|
| `Leaderboard.CreateOptions` | Config for creating/retrieving a leaderboard |
| `Leaderboard.RetrievalOptions` | Config for fetching entries |
| `Leaderboard.UsersType.Global` | All Lens users worldwide |
| `Leaderboard.UsersType.Friends` | Current user's Snapchat friends only |
| `Leaderboard.UserRecord` | Entry: `.snapchatUser`, `.score`, `.globalExactRank?`, `.globalRankPercentile` |

---

## CreateOptions Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Leaderboard identifier (Lens-scoped) |
| `orderingType` | `Leaderboard.OrderingType` | `Descending` = high score first, `Ascending` = low score first |
| `ttlSeconds` | number | Auto-reset interval (e.g. 86400 = daily) |

---

## UI Integration (SIK)

The Leaderboard module returns raw data — build UI with SIK components:

```typescript
// After loadGlobal(), populate a scrollable list:
onLoaded: (entries, me) => {
  entries.forEach((entry, i) => {
    // Create a SIK list item for each entry
    const item = this.createListItem()
    item.rank = i + 1
    item.displayName = entry.snapchatUser.displayName ?? 'Anonymous'
    item.score = entry.score
  })
}
```

> A complete Leaderboard UI example with SIK components is available in the Lens Studio Asset Library.

---

## Limitations

- Users must **opt in** to share scores — `currentUserRecord` may be null if user declined
- No built-in UI — must build display with SIK or custom components
- Leaderboard is identified by **Lens ID + name** — same name in different Lenses = different boards
- Only available on Spectacles device, not Snapchat mobile
